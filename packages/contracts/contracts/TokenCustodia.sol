// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import {Material, ModalidadEntrega, QuienAbsorbe} from "./TiposComunes.sol";
import {IRegistroEntidades} from "./RegistroEntidades.sol";

interface ITokenCustodia {
    function loteInfo(uint256 loteId)
        external
        view
        returns (
            Material material,
            uint8 varianteId,
            address custodioActual,
            uint256 pesoActual,
            uint256 pesoAceptadoOrigen,
            bool activo
        );

    function aportesDeLote(uint256 loteId)
        external
        view
        returns (address[] memory separadoresList, uint256[] memory kgPorSeparador);

    function mermaDeLote(uint256 loteId)
        external
        view
        returns (address[] memory intermediariosList, uint256[] memory gramosMerma);

    // Solo MercadoCertificados (MERCADO_ROLE): consolida los lotes consumidos en una
    // transformacion en un unico "lote" terminal (sin custodio vivo, pesoActual/
    // pesoAceptadoOrigen/aportes/merma ya fusionados) y devuelve su id para que
    // MercadoCertificados lea esos datos via loteInfo/aportesDeLote/mermaDeLote.
    function consumirParaTransformacion(uint256[] calldata loteIds, address transformador)
        external
        returns (uint256 loteConsolidadoId);

    event EntregaRegistrada(
        uint256 indexed loteId,
        address indexed separador,
        address indexed receptor,
        Material material,
        uint8 varianteId,
        uint256 pesoGramos,
        ModalidadEntrega modalidad,
        uint256 precioUSDTporKg
    );
    event LoteCreado(uint256 indexed loteId, Material material, uint8 varianteId, address indexed custodioInicial);
    event LoteUnido(uint256 indexed nuevoLoteId, uint256[] loteIdsOrigen, uint256[] pesosOrigen, uint8 varianteResultante);
    event LoteDividido(uint256 indexed loteIdOrigen, uint256[] nuevosLoteIds, uint256[] pesos);
    event EnvioDeclarado(uint256 indexed loteId, address indexed de, address indexed hacia, uint256 pesoEnviado, uint256 precioUSDTporKg);
    event RecepcionConfirmada(uint256 indexed loteId, address indexed de, address indexed hacia, uint256 pesoRecibido, uint256 merma, QuienAbsorbe quienAbsorbe);
    event LoteConsumido(uint256 indexed loteConsolidadoId, uint256[] loteIdsOrigen, address indexed transformador, uint256 pesoActualTotal, uint256 pesoAceptadoOrigenTotal);
}

/// @notice Token de custodia multi-material. El PDF pide ERC-1155 pero aclara que "no se puede
/// transferir libremente: solo se mueve con el material" -- por eso hereda ERC1155Upgradeable
/// (balance por (custodio, loteId), eventos estandar para wallets/exploradores) pero
/// sobrescribe `_update` para bloquear `safeTransferFrom`/`safeBatchTransferFrom`: el balance
/// solo cambia via nuestras funciones controladas, que siempre queman+acunan (nunca mueven un
/// balance existente directo), ver seccion 2.1 del documento de arquitectura.
///
/// `tokenId == loteId`: cada lote fisico es su propio id (no el material -- el material es un
/// campo del lote). En todo momento, a lo sumo UNA direccion tiene balance > 0 para un loteId
/// dado (el custodio actual) -- no es un token fraccionado entre varios holders.
contract TokenCustodia is
    Initializable,
    ERC1155Upgradeable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    UUPSUpgradeable,
    ITokenCustodia
{
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    // Otorgado al contrato MercadoCertificados tras desplegarlo (ver scripts/deploy.ts) --
    // unico habilitado a consumir lotes al registrar una transformacion.
    bytes32 public constant MERCADO_ROLE = keccak256("MERCADO_ROLE");

    IRegistroEntidades public registro;
    uint256 public nextLoteId;

    struct Lote {
        Material material;
        uint8 varianteId;
        address custodioActual;
        uint256 pesoActual;          // balance fisico real -- se reduce con cada merma de traspaso
        uint256 pesoAceptadoOrigen;  // fijo desde la primera entrega; base del reparto (Tabla 11
                                      // del documento: "calculados sobre el valor de los
                                      // kilogramos aceptados en el origen"). NO se reduce por
                                      // merma -- cada merma se le resta a quien la genero, no al
                                      // total que reparte la venta.
        bool activo;
        bool pendienteDeConfirmacion;
        address destinatarioPendiente;
        uint256 pesoEnviadoPendiente;
        uint256 precioPendiente;
    }

    mapping(uint256 => Lote) public lotes;

    // Aportes de cada separador a un lote (se acumulan al recibir entregas y se fusionan al
    // unir/dividir/consumir). Mapping + lista "primer toque" en vez de un array que crece sin
    // control: cada operacion queda O(1) amortizado por separador tocado, nunca hace falta
    // escanear linealmente para saber si alguien ya esta en la lista.
    mapping(uint256 => mapping(address => uint256)) public aportePorSeparador;
    mapping(uint256 => address[]) internal _separadoresDelLote;
    mapping(uint256 => mapping(address => bool)) internal _separadorListado;

    // Merma acumulada atribuida a cada intermediario que toco un lote (via confirmarRecepcion).
    // Mismo patron mapping+lista que los aportes.
    mapping(uint256 => mapping(address => uint256)) public mermaAtribuidaGramos;
    mapping(uint256 => address[]) internal _intermediariosDelLote;
    mapping(uint256 => mapping(address => bool)) internal _intermediarioListado;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address admin, address _registro) public initializer {
        __ERC1155_init("");
        __AccessControl_init();
        __Pausable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);

        registro = IRegistroEntidades(_registro);
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // ==== ENTREGA ====
    // Quien recibe (Intermediario verificado) llama esto y paga el gas -- mismo patron de UX
    // que DAPP Plastico Tesis: el separador no necesita POL para participar.
    function registrarEntrega(
        address separador,
        Material material,
        uint8 varianteId,
        uint256 pesoGramos,
        uint256 loteDestino, // 0 = crear lote nuevo
        ModalidadEntrega modalidad,
        uint256 precioUSDTporKg
    ) external whenNotPaused returns (uint256 loteId) {
        require(pesoGramos > 0, "Peso debe ser > 0");
        // Normalmente el primer receptor es un Intermediario, pero el documento tambien
        // contempla que el material llegue "directo al transformador" (Tabla 11, "Sin
        // intermediarios") -- por eso un Transformador verificado tambien puede recibir una
        // entrega de primera mano, no solo via traspaso de un intermediario.
        require(
            registro.esIntermediarioVerificado(msg.sender) || registro.esTransformadorVerificado(msg.sender),
            "Receptor no es intermediario ni transformador verificado"
        );
        require(registro.esSeparador(separador), "Origen no es separador registrado");

        if (loteDestino == 0) {
            loteId = ++nextLoteId;
            lotes[loteId] = Lote({
                material: material,
                varianteId: varianteId,
                custodioActual: msg.sender,
                pesoActual: 0,
                pesoAceptadoOrigen: 0,
                activo: true,
                pendienteDeConfirmacion: false,
                destinatarioPendiente: address(0),
                pesoEnviadoPendiente: 0,
                precioPendiente: 0
            });
            emit LoteCreado(loteId, material, varianteId, msg.sender);
        } else {
            loteId = loteDestino;
            Lote storage lote = lotes[loteId];
            require(lote.activo, "Lote no existe o no esta activo");
            require(lote.custodioActual == msg.sender, "No sos el custodio de ese lote");
            require(!lote.pendienteDeConfirmacion, "Lote con traspaso pendiente");
            require(lote.material == material, "Material no coincide con el lote");
            require(lote.varianteId == varianteId, "Variante no coincide con el lote");
        }

        Lote storage l = lotes[loteId];
        l.pesoActual += pesoGramos;
        l.pesoAceptadoOrigen += pesoGramos;

        _acumularAporte(loteId, separador, pesoGramos);
        _mint(msg.sender, loteId, pesoGramos, "");

        emit EntregaRegistrada(loteId, separador, msg.sender, material, varianteId, pesoGramos, modalidad, precioUSDTporKg);
    }

    // ==== TRASPASO EN DOS PASOS ====

    function declararEnvio(
        uint256 loteId,
        address destinatario,
        uint256 pesoEnviado,
        uint256 precioUSDTporKg
    ) external whenNotPaused {
        Lote storage lote = lotes[loteId];
        require(lote.activo, "Lote no existe o no esta activo");
        require(lote.custodioActual == msg.sender, "No sos el custodio de ese lote");
        require(!lote.pendienteDeConfirmacion, "Ya hay un envio pendiente");
        // El lote se mueve completo -- para enviar una parte, dividirlo primero (dividirLote).
        require(pesoEnviado == lote.pesoActual, "Debe enviarse el peso completo del lote (dividir primero)");
        require(
            registro.esIntermediarioVerificado(destinatario) || registro.esTransformadorVerificado(destinatario),
            "Destinatario no es intermediario ni transformador verificado"
        );
        require(destinatario != msg.sender, "No podes enviarte el lote a vos mismo");

        lote.pendienteDeConfirmacion = true;
        lote.destinatarioPendiente = destinatario;
        lote.pesoEnviadoPendiente = pesoEnviado;
        lote.precioPendiente = precioUSDTporKg;

        emit EnvioDeclarado(loteId, msg.sender, destinatario, pesoEnviado, precioUSDTporKg);
    }

    function confirmarRecepcion(
        uint256 loteId,
        uint256 pesoRecibido,
        QuienAbsorbe quienAbsorbe
    ) external whenNotPaused {
        Lote storage lote = lotes[loteId];
        require(lote.pendienteDeConfirmacion, "No hay envio pendiente para este lote");
        require(lote.destinatarioPendiente == msg.sender, "No sos el destinatario declarado");
        require(pesoRecibido <= lote.pesoEnviadoPendiente, "Peso recibido no puede superar el enviado");

        address remitente = lote.custodioActual;
        uint256 pesoEnviado = lote.pesoEnviadoPendiente;
        uint256 merma = pesoEnviado - pesoRecibido;

        // Registra a AMBAS partes como participantes del lote (sin esto, un intermediario
        // que entrego/recibio sin generar merma nunca aparece en mermaDeLote, y el reparto
        // del 20% entre "los intermediarios que movieron el lote" -- Tabla 11 -- quedaria
        // incompleto). La atribucion de gramos de merma es un paso aparte.
        _registrarParticipante(loteId, remitente);
        _registrarParticipante(loteId, msg.sender);

        if (merma > 0) {
            if (quienAbsorbe == QuienAbsorbe.Envia) {
                _acumularMerma(loteId, remitente, merma);
            } else if (quienAbsorbe == QuienAbsorbe.Recibe) {
                _acumularMerma(loteId, msg.sender, merma);
            } else {
                uint256 mitadRemitente = merma / 2;
                _acumularMerma(loteId, remitente, mitadRemitente);
                _acumularMerma(loteId, msg.sender, merma - mitadRemitente);
            }
        }

        _burn(remitente, loteId, pesoEnviado);
        if (pesoRecibido > 0) {
            _mint(msg.sender, loteId, pesoRecibido, "");
        }

        lote.custodioActual = msg.sender;
        lote.pesoActual = pesoRecibido;
        lote.pendienteDeConfirmacion = false;
        lote.destinatarioPendiente = address(0);
        lote.pesoEnviadoPendiente = 0;
        lote.precioPendiente = 0;

        emit RecepcionConfirmada(loteId, remitente, msg.sender, pesoRecibido, merma, quienAbsorbe);
    }

    // ==== UNION Y DIVISION DE LOTES ====

    // El custodio compacta varios lotes propios (mismo material) en uno nuevo. Conserva
    // linaje completo de aportes y merma -- no se pierde trazabilidad al mezclar (Figura 3
    // del documento). La variante resultante la declara quien llama (si los lotes de origen
    // tenian variantes distintas, el llamador decide como etiquetar la mezcla).
    function unirLotes(uint256[] calldata loteIds, uint8 varianteResultante)
        external
        whenNotPaused
        returns (uint256 nuevoLoteId)
    {
        (uint256 pesoActualTotal, uint256 pesoAceptadoOrigenTotal, Material material, uint256[] memory pesosOrigen) =
            _consolidar(loteIds, msg.sender);

        nuevoLoteId = ++nextLoteId;
        lotes[nuevoLoteId] = Lote({
            material: material,
            varianteId: varianteResultante,
            custodioActual: msg.sender,
            pesoActual: pesoActualTotal,
            pesoAceptadoOrigen: pesoAceptadoOrigenTotal,
            activo: true,
            pendienteDeConfirmacion: false,
            destinatarioPendiente: address(0),
            pesoEnviadoPendiente: 0,
            precioPendiente: 0
        });
        _fusionarAportesYMerma(nuevoLoteId, loteIds);

        if (pesoActualTotal > 0) {
            _mint(msg.sender, nuevoLoteId, pesoActualTotal, "");
        }

        emit LoteUnido(nuevoLoteId, loteIds, pesosOrigen, varianteResultante);
    }

    // Divide un lote en N piezas que suman su peso actual completo. Cada pieza conserva
    // material/variante y una porcion proporcional de pesoAceptadoOrigen + aportes + merma
    // (la ultima pieza absorbe el residuo de la division entera, para que la suma cierre
    // exacto -- mismo patron de redondeo que el resto del sistema).
    function dividirLote(uint256 loteId, uint256[] calldata pesos)
        external
        whenNotPaused
        returns (uint256[] memory nuevosLoteIds)
    {
        Lote storage origen = lotes[loteId];
        require(origen.activo, "Lote no existe o no esta activo");
        require(origen.custodioActual == msg.sender, "No sos el custodio de ese lote");
        require(!origen.pendienteDeConfirmacion, "Lote con traspaso pendiente");
        require(pesos.length >= 2, "Dividir requiere al menos 2 piezas");

        uint256 sumaPesos = 0;
        for (uint256 i = 0; i < pesos.length; i++) {
            require(pesos[i] > 0, "Cada pieza debe pesar > 0");
            sumaPesos += pesos[i];
        }
        require(sumaPesos == origen.pesoActual, "La suma de las piezas debe igualar el peso del lote");

        uint256 pesoActualOrigen = origen.pesoActual;
        uint256 pesoAceptadoOrigenOrigen = origen.pesoAceptadoOrigen;
        Material material = origen.material;
        uint8 varianteId = origen.varianteId;

        nuevosLoteIds = new uint256[](pesos.length);
        uint256 origenAsignado = 0;

        for (uint256 i = 0; i < pesos.length; i++) {
            uint256 nuevoId = ++nextLoteId;
            uint256 pesoAceptadoPieza;
            if (i == pesos.length - 1) {
                pesoAceptadoPieza = pesoAceptadoOrigenOrigen - origenAsignado; // residuo exacto
            } else {
                pesoAceptadoPieza = (pesoAceptadoOrigenOrigen * pesos[i]) / pesoActualOrigen;
                origenAsignado += pesoAceptadoPieza;
            }

            lotes[nuevoId] = Lote({
                material: material,
                varianteId: varianteId,
                custodioActual: msg.sender,
                pesoActual: pesos[i],
                pesoAceptadoOrigen: pesoAceptadoPieza,
                activo: true,
                pendienteDeConfirmacion: false,
                destinatarioPendiente: address(0),
                pesoEnviadoPendiente: 0,
                precioPendiente: 0
            });
            _copiarAportesYMermaProporcional(nuevoId, loteId, pesos[i], pesoActualOrigen, i == pesos.length - 1);

            _mint(msg.sender, nuevoId, pesos[i], "");
            nuevosLoteIds[i] = nuevoId;
        }

        _burn(msg.sender, loteId, pesoActualOrigen);
        origen.activo = false;
        origen.pesoActual = 0;

        emit LoteDividido(loteId, nuevosLoteIds, pesos);
    }

    // ==== CONSUMO PARA TRANSFORMACION (solo MercadoCertificados) ====

    function consumirParaTransformacion(uint256[] calldata loteIds, address transformador)
        external
        override
        onlyRole(MERCADO_ROLE)
        whenNotPaused
        returns (uint256 loteConsolidadoId)
    {
        (uint256 pesoActualTotal, uint256 pesoAceptadoOrigenTotal, Material material, ) =
            _consolidar(loteIds, transformador);

        loteConsolidadoId = ++nextLoteId;
        lotes[loteConsolidadoId] = Lote({
            material: material,
            varianteId: 0,
            custodioActual: transformador, // de referencia -- no queda balance ERC1155 vivo
            pesoActual: pesoActualTotal,
            pesoAceptadoOrigen: pesoAceptadoOrigenTotal,
            activo: false, // terminal: consumido, no se puede volver a mover/unir/dividir
            pendienteDeConfirmacion: false,
            destinatarioPendiente: address(0),
            pesoEnviadoPendiente: 0,
            precioPendiente: 0
        });
        _fusionarAportesYMerma(loteConsolidadoId, loteIds);
        // No se mintea: el peso queda consumido (se transforma), no en custodia de nadie.

        emit LoteConsumido(loteConsolidadoId, loteIds, transformador, pesoActualTotal, pesoAceptadoOrigenTotal);
    }

    // ==== VISTAS ====

    function loteInfo(uint256 loteId)
        external
        view
        override
        returns (
            Material material,
            uint8 varianteId,
            address custodioActual,
            uint256 pesoActual,
            uint256 pesoAceptadoOrigen,
            bool activo
        )
    {
        Lote storage l = lotes[loteId];
        return (l.material, l.varianteId, l.custodioActual, l.pesoActual, l.pesoAceptadoOrigen, l.activo);
    }

    function aportesDeLote(uint256 loteId)
        external
        view
        override
        returns (address[] memory separadoresList, uint256[] memory kgPorSeparador)
    {
        address[] storage lista = _separadoresDelLote[loteId];
        separadoresList = new address[](lista.length);
        kgPorSeparador = new uint256[](lista.length);
        for (uint256 i = 0; i < lista.length; i++) {
            separadoresList[i] = lista[i];
            kgPorSeparador[i] = aportePorSeparador[loteId][lista[i]];
        }
    }

    function mermaDeLote(uint256 loteId)
        external
        view
        override
        returns (address[] memory intermediariosList, uint256[] memory gramosMerma)
    {
        address[] storage lista = _intermediariosDelLote[loteId];
        intermediariosList = new address[](lista.length);
        gramosMerma = new uint256[](lista.length);
        for (uint256 i = 0; i < lista.length; i++) {
            intermediariosList[i] = lista[i];
            gramosMerma[i] = mermaAtribuidaGramos[loteId][lista[i]];
        }
    }

    // ==== INTERNAS ====

    function _acumularAporte(uint256 loteId, address separador, uint256 gramos) internal {
        if (!_separadorListado[loteId][separador]) {
            _separadorListado[loteId][separador] = true;
            _separadoresDelLote[loteId].push(separador);
        }
        aportePorSeparador[loteId][separador] += gramos;
    }

    // Registra presencia (sin esto alguien que paso un lote sin perdida nunca aparece en la
    // lista -- ver confirmarRecepcion). Idempotente.
    function _registrarParticipante(uint256 loteId, address intermediario) internal {
        if (!_intermediarioListado[loteId][intermediario]) {
            _intermediarioListado[loteId][intermediario] = true;
            _intermediariosDelLote[loteId].push(intermediario);
        }
    }

    function _acumularMerma(uint256 loteId, address intermediario, uint256 gramos) internal {
        _registrarParticipante(loteId, intermediario);
        mermaAtribuidaGramos[loteId][intermediario] += gramos;
    }

    // Valida y quema los lotes de entrada (mismo custodio requerido, mismo material, activos,
    // sin traspaso pendiente) y devuelve los totales agregados. No crea el lote nuevo ni
    // fusiona aportes/merma -- eso lo hacen unirLotes/consumirParaTransformacion despues de
    // tener el nuevo id (necesario porque _fusionarAportesYMerma referencia el id destino).
    function _consolidar(uint256[] calldata loteIds, address custodioRequerido)
        internal
        returns (uint256 pesoActualTotal, uint256 pesoAceptadoOrigenTotal, Material material, uint256[] memory pesosOrigen)
    {
        require(loteIds.length >= 1, "Se requiere al menos un lote");
        pesosOrigen = new uint256[](loteIds.length);

        for (uint256 i = 0; i < loteIds.length; i++) {
            Lote storage l = lotes[loteIds[i]];
            require(l.activo, "Lote no existe o no esta activo");
            require(!l.pendienteDeConfirmacion, "Lote con traspaso pendiente");
            require(l.custodioActual == custodioRequerido, "Custodio no coincide en todos los lotes");
            if (i == 0) {
                material = l.material;
            } else {
                require(l.material == material, "Todos los lotes deben ser del mismo material");
            }

            pesosOrigen[i] = l.pesoActual;
            pesoActualTotal += l.pesoActual;
            pesoAceptadoOrigenTotal += l.pesoAceptadoOrigen;

            _burn(custodioRequerido, loteIds[i], l.pesoActual);
            l.activo = false;
            l.pesoActual = 0;
        }
    }

    function _fusionarAportesYMerma(uint256 destinoId, uint256[] calldata loteIds) internal {
        for (uint256 i = 0; i < loteIds.length; i++) {
            uint256 origenId = loteIds[i];

            address[] storage separadoresOrigen = _separadoresDelLote[origenId];
            for (uint256 j = 0; j < separadoresOrigen.length; j++) {
                address sep = separadoresOrigen[j];
                _acumularAporte(destinoId, sep, aportePorSeparador[origenId][sep]);
            }

            address[] storage intermediariosOrigen = _intermediariosDelLote[origenId];
            for (uint256 j = 0; j < intermediariosOrigen.length; j++) {
                address inter = intermediariosOrigen[j];
                _acumularMerma(destinoId, inter, mermaAtribuidaGramos[origenId][inter]);
            }
        }
    }

    // Copia proporcional de aportes/merma de un lote dividido a una de sus piezas nuevas.
    // `residuo == true` en la ultima pieza: se le asigna lo que falte para cerrar exacto en
    // vez de recalcular con division entera (mismo patron de redondeo que el resto del
    // sistema -- ver docs/arquitectura-certificado-transformacion.md seccion 2.3).
    function _copiarAportesYMermaProporcional(
        uint256 nuevoId,
        uint256 origenId,
        uint256 pesoPieza,
        uint256 pesoTotalOrigen,
        bool residuo
    ) internal {
        address[] storage separadoresOrigen = _separadoresDelLote[origenId];
        for (uint256 j = 0; j < separadoresOrigen.length; j++) {
            address sep = separadoresOrigen[j];
            _inicializarRestanteAporte(origenId, sep);
            uint256 porcion = residuo
                ? _aporteRestante[origenId][sep]
                : (aportePorSeparador[origenId][sep] * pesoPieza) / pesoTotalOrigen;
            _aporteRestante[origenId][sep] -= porcion;
            if (porcion > 0) _acumularAporte(nuevoId, sep, porcion);
        }

        address[] storage intermediariosOrigen = _intermediariosDelLote[origenId];
        for (uint256 j = 0; j < intermediariosOrigen.length; j++) {
            address inter = intermediariosOrigen[j];
            _inicializarRestanteMerma(origenId, inter);
            uint256 porcion = residuo
                ? _mermaRestante[origenId][inter]
                : (mermaAtribuidaGramos[origenId][inter] * pesoPieza) / pesoTotalOrigen;
            _mermaRestante[origenId][inter] -= porcion;
            // Se registra SIEMPRE (incluso con porcion == 0): un intermediario que paso el
            // lote sin perdida igual debe aparecer para compartir el 20% intermediario de
            // cada pieza -- ver la misma nota en confirmarRecepcion.
            _acumularMerma(nuevoId, inter, porcion);
        }
    }

    // Restantes por dividir -- se inicializan "lazy" la primera vez que se tocan, sembrados
    // con el total original. Cada pieza no-residuo le resta su porcion proporcional; la
    // ultima pieza (residuo=true) se lleva exactamente lo que quede, para que la suma de
    // todas las piezas cierre exacto contra el total del lote original pese al redondeo de
    // la division entera en las piezas anteriores.
    mapping(uint256 => mapping(address => uint256)) internal _aporteRestante;
    mapping(uint256 => mapping(address => uint256)) internal _mermaRestante;
    mapping(uint256 => mapping(address => bool)) internal _aporteRestanteInicializado;
    mapping(uint256 => mapping(address => bool)) internal _mermaRestanteInicializado;

    function _inicializarRestanteAporte(uint256 loteId, address sep) internal {
        if (!_aporteRestanteInicializado[loteId][sep]) {
            _aporteRestanteInicializado[loteId][sep] = true;
            _aporteRestante[loteId][sep] = aportePorSeparador[loteId][sep];
        }
    }

    function _inicializarRestanteMerma(uint256 loteId, address inter) internal {
        if (!_mermaRestanteInicializado[loteId][inter]) {
            _mermaRestanteInicializado[loteId][inter] = true;
            _mermaRestante[loteId][inter] = mermaAtribuidaGramos[loteId][inter];
        }
    }

    // Bloquea el camino de transferencia estandar de ERC1155 (safeTransferFrom /
    // safeBatchTransferFrom, from!=0 && to!=0): la custodia solo se mueve via
    // declararEnvio/confirmarRecepcion (burn+mint internos, from==0 o to==0). Mint y burn
    // siguen funcionando normalmente para nuestras propias funciones.
    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
        internal
        override
    {
        require(
            from == address(0) || to == address(0),
            "Custodia no se transfiere libremente -- usar declararEnvio/confirmarRecepcion"
        );
        super._update(from, to, ids, values);
    }

    // ERC1155Upgradeable y AccessControlUpgradeable declaran supportsInterface por separado --
    // Solidity exige resolver el diamante explicitamente.
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155Upgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
    {}

    /// @dev Reservado para variables de estado de futuras versiones (patron UUPS).
    uint256[44] private __gap;
}
