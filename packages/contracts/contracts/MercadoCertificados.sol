// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuardTransient.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {Material} from "./TiposComunes.sol";
import {IRegistroEntidades} from "./RegistroEntidades.sol";
import {ITokenCustodia} from "./TokenCustodia.sol";
import {CertificadoTransformacion, ICertificadoTransformacion} from "./CertificadoTransformacion.sol";

/// @notice Orquestador central: transformacion -> emision -> venta primaria (reparto no
/// custodial + cascada de merma) -> retiro. Ver docs/arquitectura-certificado-transformacion.md
/// -- este contrato implementa las secciones 2.2, 2.3 y 2.4 tal como quedaron confirmadas.
contract MercadoCertificados is
    Initializable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardTransient,
    UUPSUpgradeable
{
    using SafeERC20 for IERC20;

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    IRegistroEntidades public registro;
    ITokenCustodia public tokenCustodia;
    IERC20 public usdt;
    address public certificadoImplementacion;
    address public plataforma;

    mapping(Material => address) public certificados;

    /// @dev "LoteDeEmision" del documento de arquitectura (seccion 2.2): snapshot inmutable,
    /// tomado una sola vez al transformar, de todo lo necesario para repartir cualquier venta
    /// futura (parcial o total) de este lote sin tener que volver a consultar TokenCustodia.
    struct Emision {
        Material material;
        address transformador;
        uint256 kgTransformadosOriginal; // fijo
        uint256 kgDisponiblesPrimario;   // decrece con cada venta parcial
        uint256 pesoAceptadoOrigenTotal; // base teorica del reparto (incluye lo perdido a merma)
        uint256 precioUSDTporKg;
        uint256 loteConsolidadoId;       // referencia informativa al lote terminal en TokenCustodia
        bool existe;
    }

    mapping(uint256 => Emision) public emisiones;
    uint256 public nextEmisionId;

    mapping(uint256 => address[]) internal _separadoresDeEmision;
    mapping(uint256 => mapping(address => uint256)) public aporteKgDeEmision;
    // "Eslabones" = intermediarios que tocaron el lote + el transformador -- los unicos que
    // pueden generar merma (los separadores nunca, ver seccion 2.4).
    mapping(uint256 => address[]) internal _eslabonesDeEmision;
    mapping(uint256 => mapping(address => uint256)) public mermaKgDeEmision;

    /// @notice Saldo en USDT que cada direccion puede retirar -- ver seccion 2.3 del documento:
    /// patron ledger + retiro permissionless (como PaymentSplitter de OZ) en vez de empujar un
    /// `transfer` a cada destinatario dentro de la venta.
    mapping(address => uint256) public saldoPendiente;

    event CertificadoDesplegado(Material indexed material, address indexed clone, string nombre, string simbolo);
    event TransformacionRegistrada(
        uint256 indexed emisionId,
        address indexed transformador,
        Material material,
        uint256[] loteIdsConsumidos,
        uint256 loteConsolidadoId,
        uint256 pesoConsumidoTotal,
        uint256 kgTransformados,
        uint256 mermaTransformador,
        uint256 precioUSDTporKg
    );
    event CertificadoComprado(uint256 indexed emisionId, address indexed comprador, uint256 cantidadKg, uint256 valorTotal);
    event PagoAcreditado(uint256 indexed emisionId, address indexed destinatario, uint256 monto);
    event PagoRetirado(address indexed destinatario, uint256 monto);
    event CertificadoRetirado(address indexed comprador, Material material, uint256 cantidadKg, bytes32 informeRef, uint32 periodo);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address admin,
        address _registro,
        address _tokenCustodia,
        address _usdt,
        address _certificadoImplementacion,
        address _plataforma
    ) public initializer {
        __AccessControl_init();
        __Pausable_init();

        require(_plataforma != address(0), "plataforma invalida");

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);

        registro = IRegistroEntidades(_registro);
        tokenCustodia = ITokenCustodia(_tokenCustodia);
        usdt = IERC20(_usdt);
        certificadoImplementacion = _certificadoImplementacion;
        plataforma = _plataforma;
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // ==== CATALOGO: UN CERTIFICADO ERC20 POR MATERIAL ====

    function desplegarCertificado(
        Material material,
        string calldata nombre,
        string calldata simbolo
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(certificados[material] == address(0), "Ya desplegado para ese material");
        address clone = Clones.clone(certificadoImplementacion);
        CertificadoTransformacion(clone).initialize(nombre, simbolo, address(this));
        certificados[material] = clone;
        emit CertificadoDesplegado(material, clone, nombre, simbolo);
    }

    // ==== TRANSFORMACION Y EMISION ====

    /// @notice El transformador consume lotes que tiene en custodia y declara cuantos kg
    /// transformo efectivamente (el resto, pesoConsumido - kgTransformados, es su propia
    /// merma -- seccion 2.4). Fija el precio del certificado en el mismo paso: Fase 1 usa
    /// precio libre, fijado por quien vende (tema abierto del documento original, seccion 10 --
    /// ver decision confirmada en la seccion 4 del documento de arquitectura).
    function registrarTransformacion(
        uint256[] calldata loteIds,
        uint256 kgTransformados,
        uint256 precioUSDTporKg
    ) external whenNotPaused returns (uint256 emisionId) {
        require(registro.esTransformadorVerificado(msg.sender), "No es transformador verificado");
        require(kgTransformados > 0, "kgTransformados debe ser > 0");
        require(precioUSDTporKg > 0, "precio debe ser > 0");

        uint256 loteConsolidadoId = tokenCustodia.consumirParaTransformacion(loteIds, msg.sender);
        (
            Material material,
            ,
            ,
            uint256 pesoActualTotal,
            uint256 pesoAceptadoOrigenTotal,

        ) = tokenCustodia.loteInfo(loteConsolidadoId);

        require(kgTransformados <= pesoActualTotal, "kgTransformados no puede superar el peso consumido");
        require(certificados[material] != address(0), "Material sin certificado desplegado");

        uint256 mermaTransformador = pesoActualTotal - kgTransformados;

        emisionId = ++nextEmisionId;
        emisiones[emisionId] = Emision({
            material: material,
            transformador: msg.sender,
            kgTransformadosOriginal: kgTransformados,
            kgDisponiblesPrimario: kgTransformados,
            pesoAceptadoOrigenTotal: pesoAceptadoOrigenTotal,
            precioUSDTporKg: precioUSDTporKg,
            loteConsolidadoId: loteConsolidadoId,
            existe: true
        });

        (address[] memory separadoresList, uint256[] memory kgPorSeparador) = tokenCustodia.aportesDeLote(loteConsolidadoId);
        for (uint256 i = 0; i < separadoresList.length; i++) {
            _separadoresDeEmision[emisionId].push(separadoresList[i]);
            aporteKgDeEmision[emisionId][separadoresList[i]] = kgPorSeparador[i];
        }

        (address[] memory intermediariosList, uint256[] memory gramosMerma) = tokenCustodia.mermaDeLote(loteConsolidadoId);
        bool transformadorYaListado = false;
        for (uint256 i = 0; i < intermediariosList.length; i++) {
            _eslabonesDeEmision[emisionId].push(intermediariosList[i]);
            mermaKgDeEmision[emisionId][intermediariosList[i]] = gramosMerma[i];
            if (intermediariosList[i] == msg.sender) transformadorYaListado = true;
        }
        // El transformador recibio cada lote via un traspaso (confirmarRecepcion), asi que ya
        // deberia estar en la lista de arriba -- este caso solo cubre defensivamente si no lo
        // estuviera. En cualquier caso, la merma de la transformacion en si (distinta de la
        // merma del ultimo traspaso) se suma aparte con +=, nunca se pisa.
        if (!transformadorYaListado) {
            _eslabonesDeEmision[emisionId].push(msg.sender);
        }
        mermaKgDeEmision[emisionId][msg.sender] += mermaTransformador;

        emit TransformacionRegistrada(
            emisionId, msg.sender, material, loteIds, loteConsolidadoId,
            pesoActualTotal, kgTransformados, mermaTransformador, precioUSDTporKg
        );
    }

    // ==== VENTA PRIMARIA ====

    /// @notice El comprador paga y recibe el certificado en la misma llamada -- igual patron
    /// de "quien paga asume el gas" que el resto del sistema. Puede comprarse en partes: cada
    /// compra parcial se escala exactamente contra kgTransformadosOriginal (seccion 2.3/2.4).
    function comprarCertificado(uint256 emisionId, uint256 cantidadKg) external whenNotPaused nonReentrant {
        Emision storage emision = emisiones[emisionId];
        require(emision.existe, "Emision no existe");
        require(registro.esComprador(msg.sender), "No es comprador registrado");
        require(cantidadKg > 0 && cantidadKg <= emision.kgDisponiblesPrimario, "Cantidad invalida");

        uint256 valorTotal = cantidadKg * emision.precioUSDTporKg;
        usdt.safeTransferFrom(msg.sender, address(this), valorTotal);

        _repartirVenta(emisionId, cantidadKg, valorTotal);

        emision.kgDisponiblesPrimario -= cantidadKg;

        ICertificadoTransformacion(certificados[emision.material]).mint(msg.sender, cantidadKg * 1e18);

        emit CertificadoComprado(emisionId, msg.sender, cantidadKg, valorTotal);
    }

    /// @dev Implementa Tabla 11 + la cascada de merma de la seccion 2.4 del documento de
    /// arquitectura. `valorTotal` (lo que de verdad se cobro) y `valorBaseTotal` (lo que
    /// hubiera valido sin ninguna merma, Tabla 12: "35% x 10,000" en vez de "35% x 9,506")
    /// son numeros distintos a proposito -- el hueco entre ambos lo paga quien genero la
    /// perdida, nunca la plataforma.
    function _repartirVenta(uint256 emisionId, uint256 cantidadKg, uint256 valorTotal) internal {
        Emision storage emision = emisiones[emisionId];

        uint256 baseEscalada = (emision.pesoAceptadoOrigenTotal * cantidadKg) / emision.kgTransformadosOriginal;
        uint256 valorBaseTotal = baseEscalada * emision.precioUSDTporKg;

        uint256 baseSeparadores = (valorBaseTotal * 3500) / 10000;
        uint256 baseIntermediariosTotal = (valorBaseTotal * 2000) / 10000;
        uint256 baseTransformador = (valorBaseTotal * 3000) / 10000;
        // La plataforma es el residuo EXACTO de valorBaseTotal contra los otros 3 (nunca un
        // 15% directo): asi absorbe el redondeo de las 3 divisiones enteras de arriba. OJO:
        // a proposito NO es un residuo contra valorTotal (lo realmente cobrado) -- Tabla 11
        // es explicita en que "la plataforma no participa" de cubrir merma de nadie. Si fuera
        // residuo contra valorTotal, un faltante tan grande que ni el grupo de separadores
        // alcance a cubrirlo (ver mas abajo) terminaria pagandoselo a la plataforma como un
        // sobrante no merecido. Con este diseno, ese caso extremo simplemente deja el
        // remanente sin acreditar a nadie (se queda como balance del contrato) -- mas seguro
        // que premiar a la plataforma por una perdida ajena.
        uint256 basePlataforma = valorBaseTotal - baseSeparadores - baseIntermediariosTotal - baseTransformador;

        address[] storage eslabones = _eslabonesDeEmision[emisionId];
        uint256 nEslabones = eslabones.length;

        uint256 nIntermediariosReales = 0;
        for (uint256 i = 0; i < nEslabones; i++) {
            if (eslabones[i] != emision.transformador) nIntermediariosReales++;
        }
        // "Sin intermediarios" (Tabla 11): si nadie mas que el transformador toco el lote, el
        // 20% que les hubiera correspondido queda sin asignar en el loop de eslabones mas
        // abajo -- se lo sumamos aca a la plataforma explicitamente, para que no quede
        // huerfano en el contrato.
        uint256 baseShareIntermediarioIndividual = 0;
        if (nIntermediariosReales > 0) {
            baseShareIntermediarioIndividual = baseIntermediariosTotal / nIntermediariosReales;
            // Redondeo de ESTA division tambien a la plataforma (nIntermediariosReales no
            // siempre divide baseIntermediariosTotal exacto).
            basePlataforma += baseIntermediariosTotal - (baseShareIntermediarioIndividual * nIntermediariosReales);
        } else {
            basePlataforma += baseIntermediariosTotal;
        }

        uint256[] memory shareFinal = new uint256[](nEslabones);
        uint256 faltanteTotal = 0;
        uint256 eslabonesEnFalta = 0;

        for (uint256 i = 0; i < nEslabones; i++) {
            address eslabon = eslabones[i];
            uint256 baseShare = (eslabon == emision.transformador) ? baseTransformador : baseShareIntermediarioIndividual;
            uint256 mermaEscalada = (mermaKgDeEmision[emisionId][eslabon] * cantidadKg) / emision.kgTransformadosOriginal;
            uint256 perdidaValor = mermaEscalada * emision.precioUSDTporKg;

            if (perdidaValor <= baseShare) {
                shareFinal[i] = baseShare - perdidaValor;
            } else {
                shareFinal[i] = 0;
                faltanteTotal += perdidaValor - baseShare;
                eslabonesEnFalta++;
            }
        }

        if (faltanteTotal > 0) {
            if (eslabonesEnFalta == 1) {
                // Un solo eslabon en falta: se reparte entre "los demas" (Tabla 11) --
                // separadores como un grupo + cada otro eslabon que siga con shareFinal > 0.
                uint256 nOtros = 1; // el grupo de separadores cuenta como uno
                for (uint256 i = 0; i < nEslabones; i++) {
                    if (shareFinal[i] > 0) nOtros++;
                }
                uint256 porCadaOtro = faltanteTotal / nOtros;
                uint256 cubierto = 0;
                for (uint256 i = 0; i < nEslabones; i++) {
                    if (shareFinal[i] == 0) continue;
                    uint256 resta = porCadaOtro > shareFinal[i] ? shareFinal[i] : porCadaOtro;
                    shareFinal[i] -= resta;
                    cubierto += resta;
                }
                uint256 restoSeparadores = faltanteTotal - cubierto;
                baseSeparadores = restoSeparadores >= baseSeparadores ? 0 : baseSeparadores - restoSeparadores;
            } else {
                // Dos o mas eslabones en falta: en vez de repartir entre un grupo de "otros"
                // cada vez mas chico, se cubre directo desde los separadores (decision
                // confirmada, seccion 2.4 del documento de arquitectura).
                baseSeparadores = faltanteTotal >= baseSeparadores ? 0 : baseSeparadores - faltanteTotal;
            }
        }

        uint256 totalAcreditado = 0;

        for (uint256 i = 0; i < nEslabones; i++) {
            if (shareFinal[i] > 0) {
                saldoPendiente[eslabones[i]] += shareFinal[i];
                totalAcreditado += shareFinal[i];
                emit PagoAcreditado(emisionId, eslabones[i], shareFinal[i]);
            }
        }

        address[] storage separadoresList = _separadoresDeEmision[emisionId];
        uint256 sumSeparadores = 0;
        for (uint256 i = 0; i < separadoresList.length; i++) {
            address sep = separadoresList[i];
            uint256 aporteEscalado = (aporteKgDeEmision[emisionId][sep] * cantidadKg) / emision.kgTransformadosOriginal;
            uint256 pagoSep = (baseSeparadores * aporteEscalado) / baseEscalada;
            if (pagoSep > 0) {
                saldoPendiente[sep] += pagoSep;
                sumSeparadores += pagoSep;
                totalAcreditado += pagoSep;
                emit PagoAcreditado(emisionId, sep, pagoSep);
            }
        }

        // La plataforma tambien se lleva el redondeo residual de la division pro-rata de
        // arriba (baseSeparadores - sumSeparadores es siempre pequeno: la suma de pisos de
        // fracciones que suman <=1 nunca supera el total -- nunca puede dar negativo).
        uint256 pagoPlataforma = basePlataforma + (baseSeparadores - sumSeparadores);
        totalAcreditado += pagoPlataforma;

        // Invariante de seguridad: esta venta nunca puede acreditar mas USDT del que
        // efectivamente se cobro (comprarCertificado ya hizo el safeTransferFrom por
        // `valorTotal` antes de llamar aca). Si esto llegara a revertir seria un bug real en
        // la formula de arriba, no un caso de negocio esperado -- mejor que revertir la venta
        // a que el contrato quede insolvente para otras emisiones.
        require(totalAcreditado <= valorTotal, "Invariante de reparto violada");

        saldoPendiente[plataforma] += pagoPlataforma;
        emit PagoAcreditado(emisionId, plataforma, pagoPlataforma);
    }

    // ==== RETIRO DE PAGOS (permissionless, ver seccion 2.3) ====

    function retirarPago(address destinatario) external nonReentrant {
        uint256 monto = saldoPendiente[destinatario];
        require(monto > 0, "Sin saldo pendiente");
        saldoPendiente[destinatario] = 0;
        usdt.safeTransfer(destinatario, monto);
        emit PagoRetirado(destinatario, monto);
    }

    // ==== RETIRO DE CERTIFICADO (uso en un informe de cumplimiento) ====

    function retirarCertificado(
        Material material,
        uint256 cantidadKg,
        bytes32 informeRef,
        uint32 periodo
    ) external whenNotPaused {
        require(registro.esComprador(msg.sender), "No es comprador registrado");
        address certAddr = certificados[material];
        require(certAddr != address(0), "Material sin certificado desplegado");

        ICertificadoTransformacion(certAddr).burn(msg.sender, cantidadKg * 1e18);

        emit CertificadoRetirado(msg.sender, material, cantidadKg, informeRef, periodo);
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
    {}

    /// @dev Reservado para variables de estado de futuras versiones (patron UUPS).
    uint256[44] private __gap;
}
