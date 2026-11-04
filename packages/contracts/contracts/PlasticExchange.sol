/// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

// ============ IMPORTS ============

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuardTransient.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// ============ INTERFACES & STRUCTS ============

interface IPlasticoToken {
    function mint(address to, uint256 amount, uint256 transaccionId) external;
    function burnFrom(address account, uint256 amount) external;
    function balanceOf(address account) external view returns (uint256);

    event TokensMinteados(
        address indexed destinatario,
        uint256 cantidad,
        uint256 transaccionId
    );
}

enum Provincia { 
    SanJose, Alajuela, Cartago, Heredia, 
    Guanacaste, Puntarenas, Limon 
}

struct Residencia {
    Provincia provincia;
    uint8 cantonId;
    uint32 loteM2;
    uint8 tipoVivienda;
}

interface IRegistroEntidades {
    // Registro plano de usuario: cada campo de Residencia se pasa por separado
    // para que el usuario los llene uno por uno en la interfaz (sin tuplas/calldata)
    function registrarUsuario(
        bytes32 _identidadHash,
        uint8   _provinciaId,  // índice del enum Provincia (0=SanJose ... 6=Limon)
        uint8   _cantonId,     // ID del cantón dentro de la provincia
        uint32  _loteM2,       // superficie del lote en m² (opcional, puede ser 0)
        uint8   _tipoVivienda  // sin enum on-chain -- valor libre; catalogo real en
                               // packages/frontend/lib/catalogos.ts (TIPOS_VIVIENDA)
    ) external;

    // Registro plano de centro recolector: Residencia también aplana
    function registrarCentroRecolector(
        bytes32 _nombreHash,
        bytes32 _cedulaHash,
        uint8   _provinciaId,
        uint8   _cantonId,
        uint32  _loteM2,
        uint8   _tipoVivienda,
        bool    _esPublico
    ) external;

    function verificarCentro(address _centro) external;

    // En Costa Rica cada canton tiene su propia municipalidad: registrar su provincia/canton
    // permite relacionar lotes y usuarios con la municipalidad correcta cuando varias
    // municipalidades de la misma provincia tienen rutas abiertas al mismo tiempo.
    function registrarMunicipalidad(
        address wallet,
        bytes32 nombreHash,
        uint8   _provinciaId,
        uint8   _cantonId
    ) external;

    function esUsuario(address account) external view returns (bool);
    function esCentroVerificado(address account) external view returns (bool);
    function esMunicipalidad(address account) external view returns (bool);

    event UsuarioRegistrado(address indexed wallet, bytes32 identidadHash); 
    event CentroRegistrado(address indexed wallet, bytes32 nombreHash); 
    event CentroVerificado(address indexed centro, address indexed verificador); 
    event MunicipalidadRegistrada(address indexed wallet, bytes32 nombreHash);
}

enum TipoPlastico { 
    Desconocido,
    PET,
    PEAD,
    PVC,
    PEBD,
    PP,
    PS,
    Otros
}

enum TipoTransaccion { 
    UsuarioACentroGratis,
    UsuarioACentroUsuarioRecibe,
    UsuarioACentroUsuarioPaga,
    UsuarioAMunicipalidad,
    CentroACentro,
    ReconciliacionMunicipal
}

interface ITransaccionesPlastico {
    function registrarTransaccionGratuita(
        address usuario,
        uint256 pesoGramos,
        TipoTransaccion tipo,
        TipoPlastico tipoPlastico
    ) external returns (uint256 transaccionId);
    
    function registrarTransaccionPagada(
        address contraparte,
        uint256 pesoGramos,
        uint256 montoUSDT,
        bool usuarioPaga,
        TipoPlastico tipoPlastico
    ) external returns (uint256 transaccionId);

    function iniciarLoteMunicipal(
        uint64 _fechaRecoleccion,
        uint8  _rutaId  // ID numérico de la ruta municipal; cada municipio define sus propias rutas por cantón
    ) external returns (uint256 loteId);

    function registrarEntregaMunicipal(
        uint256      _loteId,
        address      _usuario,
        uint256      _pesoGramos,
        TipoPlastico _tipoPlastico,
        uint8        _rutaId  // El usuario ingresa su rutaId habitual; se valida contra el lote
    ) external returns (uint256 transaccionId);

    // Autoservicio: el propio Usuario reporta su entrega a un lote abierto y paga su gas,
    // en vez de que la municipalidad la entre por el (registrarEntregaMunicipal se mantiene
    // como respaldo para usuarios que no puedan hacerlo por su cuenta).
    function registrarEntregaUsuario(
        uint256      _loteId,
        uint256      _pesoGramos,
        TipoPlastico _tipoPlastico,
        uint8        _rutaId
    ) external returns (uint256 transaccionId);

    // Cierra el lote tipo por tipo: cada tipo de plastico se reconcilia con su propio peso
    // oficial (bascula puede pesar PET y HDPE por separado, en momentos distintos). El lote
    // completo (`cerrado == true`) recien queda asi cuando todos los tipos que tuvieron
    // entregas -- o que se declararon explicitamente aca -- ya fueron reconciliados.
    function cerrarLotePorTipo(
        uint256 _loteId,
        TipoPlastico _tipoPlastico,
        uint256 _pesoOficialGramos
    ) external;

    event TransaccionRegistrada(
        uint256 indexed id,
        address indexed origen,
        address indexed destino,
        uint256 pesoGramos,
        uint256 usdtMonto,
        TipoTransaccion tipo,
        TipoPlastico tipoPlastico
    );

    event LoteMunicipalIniciado(
        uint256 indexed loteId,
        address municipalidad,
        uint64  fechaRecoleccion,
        uint8   rutaId
    );

    // Se emite una vez por cada tipo de plastico reconciliado dentro de un lote.
    event LoteTipoCerrado(
        uint256 indexed loteId,
        TipoPlastico tipoPlastico,
        uint256 pesoOficial,
        uint256 factorAjuste
    );

    // Se emite una sola vez, cuando el ultimo tipo pendiente del lote termina de
    // reconciliarse. pesoOficial es la suma de los pesos oficiales de todos los tipos;
    // factorAjuste queda fijo en 10000 (ya no es un solo ratio real -- cada tipo se
    // ajusto por separado, ver los eventos LoteTipoCerrado de este mismo lote).
    event LoteMunicipalCerrado(
        uint256 indexed loteId,
        uint256 pesoOficial,
        uint256 factorAjuste
    );

    event TransaccionReconciliada(
        uint256 indexed id,
        uint256 nuevoPesoGramos
    );
}

// ============ CONTRATO: PLASTICO TOKEN ============

contract PlasticoToken is 
    Initializable, 
    ERC20Upgradeable, 
    ERC20PausableUpgradeable, 
    AccessControlUpgradeable, 
    UUPSUpgradeable, 
    IPlasticoToken 
{
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory name_,
        string memory symbol_,
        address admin
    ) public initializer {
        __ERC20_init(name_, symbol_);
        __ERC20Pausable_init();
        __AccessControl_init();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
    }

    function mint(
        address to, 
        uint256 amount, 
        uint256 transaccionId
    ) external override onlyRole(MINTER_ROLE) {
        _mint(to, amount);
        emit TokensMinteados(to, amount, transaccionId);
    }

    function burnFrom(
        address account, 
        uint256 amount
    ) external override onlyRole(MINTER_ROLE) {
        _burn(account, amount);
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function balanceOf(address account) 
        public 
        view 
        override(ERC20Upgradeable, IPlasticoToken) 
        returns (uint256) 
    {
        return super.balanceOf(account);
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
    {}

    // Necesario en Solidity ^0.8.20+ para reconciliar la herencia múltiple de _update
    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20Upgradeable, ERC20PausableUpgradeable) {
        super._update(from, to, value);
    }

    /// @dev Reservado para variables de estado de futuras versiones (patrón UUPS).
    uint256[50] private __gap;
}

// ============ CONTRATO: REGISTRO ENTIDADES ============

contract RegistroEntidades is 
    Initializable, 
    AccessControlUpgradeable, 
    UUPSUpgradeable, 
    IRegistroEntidades 
{
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant MUNICIPALIDAD_ROLE = keccak256("MUNICIPALIDAD_ROLE");

    struct Usuario {
        bytes32 identidadHash;
        address wallet;
        Residencia residencia;
        bool activo;
        uint64 registradoEn;
    }

    struct CentroRecolector {
        bytes32 nombreHash;
        bytes32 cedulaHash;
        Residencia ubicacion;
        bool esPublico;
        bool verificado;
        uint64 verificadoEn;
        bool activo;
    }

    struct Municipalidad {
        bytes32 nombreHash;
        address wallet;
        bool activo;
        Provincia provincia;
        uint8 cantonId;
    }

    mapping(address => Usuario) public usuarios;
    mapping(address => CentroRecolector) public centros;
    mapping(address => Municipalidad) public municipalidades;
    mapping(bytes32 => address) public cedulaHashToWallet;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address admin) public initializer {
        __AccessControl_init();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(VERIFIER_ROLE, admin);
    }

    function registrarUsuario(
        bytes32 identidadHash,
        uint8   provinciaId,
        uint8   cantonId,
        uint32  loteM2,
        uint8   tipoVivienda
    ) external override {
        require(!_tieneAlgunRol(msg.sender), "La wallet ya tiene un rol asignado");
        require(cedulaHashToWallet[identidadHash] == address(0), "Cedula ya registrada");
        require(provinciaId <= uint8(type(Provincia).max), "Provincia invalida");

        // Construimos la Residencia internamente a partir de los parametros planos
        Residencia memory residencia = Residencia({
            provincia   : Provincia(provinciaId),
            cantonId    : cantonId,
            loteM2      : loteM2,
            tipoVivienda: tipoVivienda
        });

        usuarios[msg.sender] = Usuario({
            identidadHash: identidadHash,
            wallet       : msg.sender,
            residencia   : residencia,
            activo       : true,
            registradoEn : uint64(block.timestamp)
        });

        cedulaHashToWallet[identidadHash] = msg.sender;

        emit UsuarioRegistrado(msg.sender, identidadHash);
    }

    function registrarCentroRecolector(
        bytes32 nombreHash,
        bytes32 cedulaHash,
        uint8   provinciaId,
        uint8   cantonId,
        uint32  loteM2,
        uint8   tipoVivienda,
        bool    esPublico
    ) external override {
        require(!_tieneAlgunRol(msg.sender), "La wallet ya tiene un rol asignado");
        require(cedulaHashToWallet[cedulaHash] == address(0), "Cedula juridica ya registrada");
        require(provinciaId <= uint8(type(Provincia).max), "Provincia invalida");

        // Construimos la Residencia/ubicacion internamente
        Residencia memory ubicacion = Residencia({
            provincia   : Provincia(provinciaId),
            cantonId    : cantonId,
            loteM2      : loteM2,
            tipoVivienda: tipoVivienda
        });

        centros[msg.sender] = CentroRecolector({
            nombreHash  : nombreHash,
            cedulaHash  : cedulaHash,
            ubicacion   : ubicacion,
            esPublico   : esPublico,
            verificado  : false,
            verificadoEn: 0,
            activo      : true
        });

        cedulaHashToWallet[cedulaHash] = msg.sender;

        emit CentroRegistrado(msg.sender, nombreHash);
    }

    function verificarCentro(address centro) external override onlyRole(VERIFIER_ROLE) {
        require(centros[centro].activo, "Centro no existe");
        require(!centros[centro].verificado, "Centro ya verificado");
        
        centros[centro].verificado = true;
        centros[centro].verificadoEn = uint64(block.timestamp);
        
        emit CentroVerificado(centro, msg.sender);
    }

    function registrarMunicipalidad(
        address wallet,
        bytes32 nombreHash,
        uint8   _provinciaId,
        uint8   _cantonId
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        require(!_tieneAlgunRol(wallet), "La wallet ya tiene un rol asignado");
        require(_provinciaId <= uint8(type(Provincia).max), "Provincia invalida");

        municipalidades[wallet] = Municipalidad({
            nombreHash: nombreHash,
            wallet: wallet,
            provincia: Provincia(_provinciaId),
            cantonId: _cantonId,
            activo: true
        });

        _grantRole(MUNICIPALIDAD_ROLE, wallet);
        emit MunicipalidadRegistrada(wallet, nombreHash);
    }

    function esUsuario(address account) external view override returns (bool) {
        return usuarios[account].activo;
    }

    function esCentroVerificado(address account) external view override returns (bool) {
        return centros[account].verificado && centros[account].activo;
    }

    function esMunicipalidad(address account) external view override returns (bool) {
        return municipalidades[account].activo;
    }

    // Una misma wallet no puede ser Usuario, Centro y Municipalidad a la vez: evita que una
    // direccion con doble rol se autoasigne tokens (ej. registrarTransaccionGratuita con
    // usuario == msg.sender) sin que exista una entrega real.
    function _tieneAlgunRol(address wallet) internal view returns (bool) {
        return usuarios[wallet].wallet != address(0)
            || centros[wallet].cedulaHash != bytes32(0)
            || municipalidades[wallet].wallet != address(0);
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
    {}

    /// @dev Reservado para variables de estado de futuras versiones (patrón UUPS).
    uint256[50] private __gap;
}

// ============ CONTRATO: TRANSACCIONES PLÁSTICO ============

contract TransaccionesPlastico is
    Initializable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardTransient,
    UUPSUpgradeable,
    ITransaccionesPlastico
{
    using SafeERC20 for IERC20;

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    IPlasticoToken public plasticoToken;
    IRegistroEntidades public registro;
    IERC20 public usdt;

    uint256 public nextTransaccionId;
    uint256 public nextLoteId;

    struct Transaccion {
        uint256 id;
        address origen;
        address destino;
        uint216 pesoGramos;
        uint32 timestamp;
        uint256 tokensMinteados;
        uint256 usdtPagado;
        TipoTransaccion tipo;
        TipoPlastico tipoPlastico;
        bool reconciliada;
        uint256 loteId;
        // Peso tal como lo declaro quien entrego, fijado una sola vez al crear la
        // transaccion. `pesoGramos` de arriba SI se reescribe al reconciliar (ver
        // cerrarLotePorTipo) -- este campo es el unico registro permanente de "cuanto dijo
        // el usuario" para comparar contra lo que la municipalidad termino aprobando.
        uint216 pesoGramosDeclarado;
    }

    struct LoteMunicipal {
        uint256 id;
        address municipalidad;
        uint64  fechaRecoleccion;
        uint8   rutaId;            // Ruta definida por la municipalidad (única por cantón, sistema externo)
        bool    cerrado;
        // Agregados finales, solo validos una vez `cerrado == true`: suma de los pesos
        // oficiales de cada tipo reconciliado, y 10000 fijo (ver LoteMunicipalCerrado).
        // El detalle real por tipo vive en los eventos LoteTipoCerrado, no aca.
        uint256 pesoOficialGramos;
        uint256 factorAjuste;
        uint256[] transaccionesUsuarios;
        TipoPlastico[] tiposPresentes; // tipos vistos en este lote (por entrega o cierre declarado)
    }

    mapping(uint256 => Transaccion) public transacciones;
    mapping(address => uint256[]) public transaccionesPorDireccion;
    mapping(uint256 => LoteMunicipal) public lotesMunicipales;
    // (loteId => tipoPlastico => ...). Separado del struct de arriba porque un mapping (o un
    // valor que haga falta leer por tipo) dentro de un struct no se puede leer desde fuera
    // del contrato via el getter publico automatico.
    mapping(uint256 => mapping(TipoPlastico => bool)) public tipoReconciliadoDeLote;
    mapping(uint256 => mapping(TipoPlastico => uint256)) public pesoOficialPorTipo;
    mapping(uint256 => mapping(TipoPlastico => uint256)) public factorAjustePorTipo;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address admin,
        address _plasticoToken,
        address _registro,
        address _usdt
    ) public initializer {
        __AccessControl_init();
        __Pausable_init();
        // ReentrancyGuardTransient no requiere inicialización: es stateless (usa transient storage, EIP-1153).

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);

        plasticoToken = IPlasticoToken(_plasticoToken);
        registro = IRegistroEntidades(_registro);
        usdt = IERC20(_usdt);
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // ==== TRANSACCIÓN GRATUITA ====
    // Quien recibe el material (Centro o Municipalidad) inicia la Tx y asume el gas
    function registrarTransaccionGratuita(
        address usuario,
        uint256 pesoGramos,
        TipoTransaccion tipo,
        TipoPlastico tipoPlastico
    ) external override whenNotPaused returns (uint256) {
        require(pesoGramos > 0, "Peso debe ser > 0");
        require(usuario != msg.sender, "Un usuario no puede auto-entregarse material");
        require(registro.esUsuario(usuario), "Origen no es usuario registrado");

        address destino = msg.sender;

        if (tipo == TipoTransaccion.UsuarioACentroGratis) {
            require(registro.esCentroVerificado(destino), "Llamador no es centro verificado");
        } else if (tipo == TipoTransaccion.UsuarioAMunicipalidad) {
            require(registro.esMunicipalidad(destino), "Llamador no es municipalidad");
        } else {
            revert("Tipo de transaccion invalido");
        }

        uint256 txId = _registrarTransaccion(
            usuario, // origen
            destino, // destino (msg.sender)
            pesoGramos,
            0,
            tipo,
            tipoPlastico,
            0
        );

        uint256 tokens = _calcularTokens(pesoGramos, tipoPlastico);
        plasticoToken.mint(destino, tokens, txId);
        transacciones[txId].tokensMinteados = tokens;

        return txId;
    }

    // ==== TRANSACCIÓN PAGADA ====
    // Quien paga el USDT por el material inicia la transacción y asume el gas
    function registrarTransaccionPagada(
        address contraparte,
        uint256 pesoGramos,
        uint256 montoUSDT,
        bool usuarioPaga,
        TipoPlastico tipoPlastico
    ) external override whenNotPaused nonReentrant returns (uint256) {
        require(pesoGramos > 0, "Peso debe ser > 0");
        require(montoUSDT > 0, "USDT > 0");
        require(contraparte != msg.sender, "Un usuario no puede transar consigo mismo");

        address origen;
        address destino;
        TipoTransaccion tipo;

        if (usuarioPaga) {
            // El usuario paga USDT al centro (servicio especial). El llamador es el Usuario (paga gas).
            origen = msg.sender;
            destino = contraparte;
            require(registro.esUsuario(origen), "Llamador no es usuario registrado");
            require(registro.esCentroVerificado(destino), "Contraparte no es centro verificado");
            tipo = TipoTransaccion.UsuarioACentroUsuarioPaga;

            // Transferencia segura de USDT del Usuario (msg.sender) al Centro (contraparte)
            usdt.safeTransferFrom(origen, destino, montoUSDT);
        } else {
            // El centro paga USDT al usuario (compra de plastico). El llamador es el Centro (paga gas).
            origen = contraparte;
            destino = msg.sender;
            require(registro.esUsuario(origen), "Contraparte no es usuario registrado");
            require(registro.esCentroVerificado(destino), "Llamador no es centro verificado");
            tipo = TipoTransaccion.UsuarioACentroUsuarioRecibe;

            // Transferencia segura de USDT del Centro (msg.sender) al Usuario (contraparte)
            usdt.safeTransferFrom(destino, origen, montoUSDT);
        }

        uint256 txId = _registrarTransaccion(
            origen,
            destino,
            pesoGramos,
            montoUSDT,
            tipo,
            tipoPlastico,
            0
        );

        uint256 tokens = _calcularTokens(pesoGramos, tipoPlastico);
        plasticoToken.mint(destino, tokens, txId);
        transacciones[txId].tokensMinteados = tokens;

        return txId;
    }

    // ==== LOTES MUNICIPALES Y RECONCILIACIÓN ====

    function iniciarLoteMunicipal(
        uint64 fechaRecoleccion,
        uint8  rutaId
    ) external override whenNotPaused returns (uint256 loteId) {
        require(registro.esMunicipalidad(msg.sender), "No es muni");

        loteId = ++nextLoteId;
        LoteMunicipal storage lote = lotesMunicipales[loteId];
        lote.id             = loteId;
        lote.municipalidad  = msg.sender;
        lote.fechaRecoleccion = fechaRecoleccion;
        lote.rutaId         = rutaId;   // Ruta definida por la municipalidad para este lote
        lote.cerrado        = false;

        emit LoteMunicipalIniciado(loteId, msg.sender, fechaRecoleccion, rutaId);
    }

    function registrarEntregaMunicipal(
        uint256      _loteId,
        address      _usuario,
        uint256      _pesoGramos,
        TipoPlastico _tipoPlastico,
        uint8        _rutaId
    ) external override whenNotPaused returns (uint256 transaccionId) {
        LoteMunicipal storage lote = lotesMunicipales[_loteId];
        require(lote.municipalidad == msg.sender, "No autorizado");
        require(registro.esUsuario(_usuario), "No es usuario registrado");

        return _registrarEntregaEnLote(lote, _usuario, _pesoGramos, _tipoPlastico, _rutaId);
    }

    // Autoservicio: el propio Usuario reporta su entrega y paga su gas, sin depender
    // de que la municipalidad la teclee por el. Comparte la misma reconciliacion al
    // cierre del lote que registrarEntregaMunicipal (los tokens preliminares tambien
    // se mintean a la municipalidad, no al usuario: ver _registrarEntregaEnLote).
    function registrarEntregaUsuario(
        uint256      _loteId,
        uint256      _pesoGramos,
        TipoPlastico _tipoPlastico,
        uint8        _rutaId
    ) external override whenNotPaused returns (uint256 transaccionId) {
        LoteMunicipal storage lote = lotesMunicipales[_loteId];
        require(lote.municipalidad != address(0), "Lote no existe");
        require(registro.esUsuario(msg.sender), "No es usuario registrado");

        return _registrarEntregaEnLote(lote, msg.sender, _pesoGramos, _tipoPlastico, _rutaId);
    }

    function _registrarEntregaEnLote(
        LoteMunicipal storage lote,
        address usuario,
        uint256 pesoGramos,
        TipoPlastico tipoPlastico,
        uint8 rutaId
    ) internal returns (uint256 transaccionId) {
        require(!lote.cerrado, "Lote ya cerrado");
        require(pesoGramos > 0, "Peso debe ser > 0");
        require(rutaId == lote.rutaId, "Ruta no coincide con el lote"); // El usuario debe siempre ingresar el ID de su ruta
        // Si este tipo ya se reconcilio (aunque el lote siga abierto por otro tipo pendiente),
        // una entrega nueva de ese tipo se quedaria sin ajustar para siempre -- se rechaza.
        require(
            !tipoReconciliadoDeLote[lote.id][tipoPlastico],
            "Ese tipo de plastico ya se cerro en este lote"
        );

        if (!_tipoPresenteEnLote(lote, tipoPlastico)) {
            lote.tiposPresentes.push(tipoPlastico);
        }

        transaccionId = _registrarTransaccion(
            usuario, // origen
            lote.municipalidad, // destino (muni)
            pesoGramos,
            0, // USDT
            TipoTransaccion.UsuarioAMunicipalidad,
            tipoPlastico,
            lote.id
        );

        // Mintear tokens preliminares a la municipalidad (no al usuario, ver nota de diseño arriba)
        uint256 tokens = _calcularTokens(pesoGramos, tipoPlastico);
        plasticoToken.mint(lote.municipalidad, tokens, transaccionId);
        transacciones[transaccionId].tokensMinteados = tokens;

        // Registrar en el lote
        lote.transaccionesUsuarios.push(transaccionId);
    }

    function cerrarLotePorTipo(
        uint256 _loteId,
        TipoPlastico _tipoPlastico,
        uint256 _pesoOficialGramos
    ) external override whenNotPaused nonReentrant {
        LoteMunicipal storage lote = lotesMunicipales[_loteId];
        require(lote.municipalidad == msg.sender, "No autorizado");
        require(!lote.cerrado, "Lote ya cerrado");
        require(!tipoReconciliadoDeLote[_loteId][_tipoPlastico], "Ese tipo ya fue cerrado");

        // Si la municipalidad declara un tipo que nunca tuvo una entrega registrada en la
        // app (ej. una entrega en papel), se agrega aca mismo -- se trata igual que un tipo
        // con cero transacciones: se mintea el peso oficial completo, sin nada que ajustar.
        if (!_tipoPresenteEnLote(lote, _tipoPlastico)) {
            lote.tiposPresentes.push(_tipoPlastico);
        }
        tipoReconciliadoDeLote[_loteId][_tipoPlastico] = true;

        uint256 totalTransacciones = lote.transaccionesUsuarios.length;
        uint256 sumaPesosDeclarados = 0;
        uint256 sumaTokensAntes = 0;

        for (uint256 i = 0; i < totalTransacciones; i++) {
            Transaccion storage txn = transacciones[lote.transaccionesUsuarios[i]];
            if (txn.tipoPlastico != _tipoPlastico) continue;
            sumaPesosDeclarados += txn.pesoGramos;
            sumaTokensAntes += txn.tokensMinteados;
        }

        uint256 factorAjuste = 10000; // 100% (basis points)
        if (sumaPesosDeclarados > 0) {
            factorAjuste = (_pesoOficialGramos * 10000) / sumaPesosDeclarados;
        }

        // Ajustar el peso y los tokens de cada entrega de este tipo (las de otros tipos,
        // ya reconciliadas o todavia pendientes, no se tocan).
        for (uint256 i = 0; i < totalTransacciones; i++) {
            uint256 txId = lote.transaccionesUsuarios[i];
            Transaccion storage txn = transacciones[txId];
            if (txn.tipoPlastico != _tipoPlastico) continue;

            uint256 pesoAjustado = (uint256(txn.pesoGramos) * factorAjuste) / 10000;
            txn.pesoGramos = uint216(pesoAjustado);
            txn.reconciliada = true;

            uint256 tokensAjustados = _calcularTokens(pesoAjustado, txn.tipoPlastico);
            txn.tokensMinteados = tokensAjustados;

            emit TransaccionReconciliada(txId, pesoAjustado);
        }

        // Conciliar el balance de tokens de la municipalidad, solo por la porcion de este tipo
        uint256 tokensOficiales = _calcularTokens(_pesoOficialGramos, _tipoPlastico);
        if (tokensOficiales > sumaTokensAntes) {
            uint256 diff = tokensOficiales - sumaTokensAntes;
            plasticoToken.mint(msg.sender, diff, 0);
        } else if (tokensOficiales < sumaTokensAntes) {
            uint256 diff = sumaTokensAntes - tokensOficiales;
            uint256 balanceMuni = plasticoToken.balanceOf(msg.sender);
            uint256 burnAmount = diff > balanceMuni ? balanceMuni : diff;
            if (burnAmount > 0) {
                plasticoToken.burnFrom(msg.sender, burnAmount);
            }
        }

        lote.pesoOficialGramos += _pesoOficialGramos;
        pesoOficialPorTipo[_loteId][_tipoPlastico] = _pesoOficialGramos;
        factorAjustePorTipo[_loteId][_tipoPlastico] = factorAjuste;
        emit LoteTipoCerrado(_loteId, _tipoPlastico, _pesoOficialGramos, factorAjuste);

        // Si todos los tipos que aparecieron en el lote ya estan reconciliados, el lote
        // completo queda cerrado.
        uint256 totalTipos = lote.tiposPresentes.length;
        for (uint256 i = 0; i < totalTipos; i++) {
            if (!tipoReconciliadoDeLote[_loteId][lote.tiposPresentes[i]]) return;
        }
        lote.cerrado = true;
        lote.factorAjuste = 10000;
        emit LoteMunicipalCerrado(_loteId, lote.pesoOficialGramos, lote.factorAjuste);
    }

    // ==== INTERNAS ====

    function _registrarTransaccion(
        address origen,
        address destino,
        uint256 pesoGramos,
        uint256 montoUSDT,
        TipoTransaccion tipo,
        TipoPlastico tipoPlastico,
        uint256 loteId
    ) internal returns (uint256) {
        uint256 id = ++nextTransaccionId;
        require(pesoGramos <= type(uint216).max, "Peso muy grande");

        transacciones[id] = Transaccion({
            id: id,
            origen: origen,
            destino: destino,
            pesoGramos: uint216(pesoGramos),
            timestamp: uint32(block.timestamp),
            tokensMinteados: 0,
            usdtPagado: montoUSDT,
            tipo: tipo,
            tipoPlastico: tipoPlastico,
            reconciliada: false,
            loteId: loteId,
            pesoGramosDeclarado: uint216(pesoGramos)
        });

        transaccionesPorDireccion[origen].push(id);
        transaccionesPorDireccion[destino].push(id);

        emit TransaccionRegistrada(
            id,
            origen,
            destino,
            pesoGramos,
            montoUSDT,
            tipo,
            tipoPlastico
        );

        return id;
    }

    function _calcularTokens(
        uint256 pesoGramos,
        TipoPlastico /*tipoPlastico*/
    ) internal pure returns (uint256) {
        // MVP: 1 gramo = 1 token con 18 decimales
        return pesoGramos * 1e18;
    }

    function getTransaccionesPorDireccion(address account)
        external
        view
        returns (uint256[] memory)
    {
        return transaccionesPorDireccion[account];
    }

    // Resumen de un tipo de plastico dentro de un lote, en una sola llamada de solo-lectura:
    // pensado para que el frontend pueda saber que tipos ya estan cerrados (y con que
    // numeros) leyendo directo del contrato, sin depender de que el indexer ya haya
    // procesado los eventos -- que puede tardar si el indexer viene atrasado.
    function resumenTipoEnLote(uint256 _loteId, TipoPlastico _tipo)
        external
        view
        returns (
            bool presente,
            bool reconciliado,
            uint256 pesoDeclaradoTotal,
            uint256 pesoActualTotal,
            uint256 pesoOficialGramos,
            uint256 factorAjuste
        )
    {
        LoteMunicipal storage lote = lotesMunicipales[_loteId];
        presente = _tipoPresenteEnLote(lote, _tipo);
        reconciliado = tipoReconciliadoDeLote[_loteId][_tipo];
        pesoOficialGramos = pesoOficialPorTipo[_loteId][_tipo];
        factorAjuste = factorAjustePorTipo[_loteId][_tipo];

        uint256 len = lote.transaccionesUsuarios.length;
        for (uint256 i = 0; i < len; i++) {
            Transaccion storage txn = transacciones[lote.transaccionesUsuarios[i]];
            if (txn.tipoPlastico != _tipo) continue;
            pesoDeclaradoTotal += txn.pesoGramosDeclarado;
            pesoActualTotal += txn.pesoGramos;
        }
    }

    function _tipoPresenteEnLote(LoteMunicipal storage lote, TipoPlastico tipo)
        internal
        view
        returns (bool)
    {
        uint256 len = lote.tiposPresentes.length;
        for (uint256 i = 0; i < len; i++) {
            if (lote.tiposPresentes[i] == tipo) return true;
        }
        return false;
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
    {}

    /// @dev Reservado para variables de estado de futuras versiones (patrón UUPS).
    /// Bajado de 50 a 47: tipoReconciliadoDeLote, pesoOficialPorTipo, factorAjustePorTipo.
    uint256[47] private __gap;
}
