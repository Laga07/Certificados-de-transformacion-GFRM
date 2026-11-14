// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import {Rol} from "./TiposComunes.sol";

enum Provincia {
    SanJose, Alajuela, Cartago, Heredia,
    Guanacaste, Puntarenas, Limon
}

struct Ubicacion {
    Provincia provincia;
    uint8 cantonId;
}

interface IRegistroEntidades {
    // Se auto-registra, sin verificacion -- igual que el Usuario de DAPP Plastico Tesis: es
    // quien entrega el material, el riesgo de que mienta sobre su propia identidad es bajo.
    function registrarSeparador(
        bytes32 _identidadHash,
        uint8   _provinciaId,
        uint8   _cantonId,
        uint8   _tipoSeparador // libre -- catalogo real en el frontend (Hogar, Comercio,
                                // Industria, Institucion, Recuperador Inclusivo)
    ) external;

    // Se registra pero queda sin verificar hasta que VERIFIER_ROLE lo confirme -- recibe
    // custodia de material de terceros, el mismo nivel de confianza que CentroRecolector
    // en DAPP Plastico Tesis.
    function registrarIntermediario(
        bytes32 _nombreHash,
        bytes32 _cedulaHash,
        uint8   _provinciaId,
        uint8   _cantonId,
        uint8   _subtipo // libre -- Recolector, Centro de acopio, Municipalidad/ruta
                          // selectiva, Compactador, Transportista
    ) external;

    // Igual de sensible que Intermediario (acuna certificados con valor real) -- tambien
    // requiere verificacion.
    function registrarTransformador(
        bytes32 _nombreHash,
        bytes32 _cedulaHash,
        uint8   _provinciaId,
        uint8   _cantonId
    ) external;

    // Se auto-registra sin verificacion: quien paga no representa un riesgo de custodia
    // para terceros. empresaObligadaLey9786 es autodeclarado, solo para reporting/analitica.
    function registrarComprador(
        bytes32 _nombreHash,
        bytes32 _cedulaHash,
        bool    _empresaObligadaLey9786
    ) external;

    function verificarIntermediario(address wallet) external;
    function verificarTransformador(address wallet) external;

    // Gobernanza operativa (VERIFIER_ROLE): sacar del sistema a una entidad que incumple y
    // volverla a habilitar. Una entidad desactivada conserva su registro (no puede volver a
    // registrarse con otra identidad desde la misma wallet) pero deja de pasar los chequeos
    // esSeparador / esIntermediarioVerificado / esTransformadorVerificado / esComprador, asi
    // que no puede recibir ni mover material, ni transformar, ni comprar.
    function desactivarEntidad(address wallet) external;
    function reactivarEntidad(address wallet) external;
    // Solo Intermediario/Transformador: vuelve a "registrado, sin verificar". Para volver a
    // operar hace falta una nueva verificacion.
    function revocarVerificacion(address wallet) external;

    function esSeparador(address account) external view returns (bool);
    function esIntermediarioVerificado(address account) external view returns (bool);
    function esTransformadorVerificado(address account) external view returns (bool);
    function esComprador(address account) external view returns (bool);
    // Rol REGISTRADO para la wallet (sin importar si esta activa) -- ver estaActiva.
    function rolDe(address account) external view returns (Rol);
    function estaActiva(address account) external view returns (bool);

    event SeparadorRegistrado(address indexed wallet, bytes32 identidadHash, uint8 tipoSeparador);
    event IntermediarioRegistrado(address indexed wallet, bytes32 nombreHash, uint8 subtipo);
    event IntermediarioVerificado(address indexed wallet, address indexed verificador);
    event TransformadorRegistrado(address indexed wallet, bytes32 nombreHash);
    event TransformadorVerificado(address indexed wallet, address indexed verificador);
    event CompradorRegistrado(address indexed wallet, bytes32 nombreHash, bool empresaObligadaLey9786);
    event EntidadDesactivada(address indexed wallet, Rol rol, address indexed por);
    event EntidadReactivada(address indexed wallet, Rol rol, address indexed por);
    event VerificacionRevocada(address indexed wallet, Rol rol, address indexed por);
}

/// @notice Generaliza RegistroEntidades de DAPP Plastico Tesis de 3 a 5 roles (Separador,
/// Intermediario, Transformador, Comprador). Misma regla de fondo: una wallet = un solo rol
/// (_tieneAlgunRol), para que nadie se autoasigne material/certificados simulando ambos
/// extremos de una operacion.
contract RegistroEntidades is
    Initializable,
    AccessControlUpgradeable,
    UUPSUpgradeable,
    IRegistroEntidades
{
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    struct Separador {
        bytes32 identidadHash;
        address wallet;
        Ubicacion ubicacion;
        uint8 tipoSeparador;
        bool activo;
        uint64 registradoEn;
    }

    struct Intermediario {
        bytes32 nombreHash;
        bytes32 cedulaHash;
        Ubicacion ubicacion;
        uint8 subtipo;
        bool verificado;
        bool activo;
        uint64 registradoEn;
    }

    struct Transformador {
        bytes32 nombreHash;
        bytes32 cedulaHash;
        Ubicacion ubicacion;
        bool verificado;
        bool activo;
        uint64 registradoEn;
    }

    struct Comprador {
        bytes32 nombreHash;
        bytes32 cedulaHash;
        bool empresaObligadaLey9786;
        bool activo;
        uint64 registradoEn;
    }

    mapping(address => Separador) public separadores;
    mapping(address => Intermediario) public intermediarios;
    mapping(address => Transformador) public transformadores;
    mapping(address => Comprador) public compradores;
    // Espacio de hashes compartido entre los 4 roles -- solo sirve para "esta identidad ya
    // se registro", igual que en DAPP Plastico Tesis (ahi tambien lo comparten
    // identidadHash de Usuario y cedulaHash de CentroRecolector).
    mapping(bytes32 => address) public identidadHashToWallet;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address admin) public initializer {
        __AccessControl_init();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(VERIFIER_ROLE, admin);
    }

    function registrarSeparador(
        bytes32 identidadHash,
        uint8   provinciaId,
        uint8   cantonId,
        uint8   tipoSeparador
    ) external override {
        require(!_tieneAlgunRol(msg.sender), "La wallet ya tiene un rol asignado");
        require(identidadHashToWallet[identidadHash] == address(0), "Identidad ya registrada");
        require(provinciaId <= uint8(type(Provincia).max), "Provincia invalida");

        separadores[msg.sender] = Separador({
            identidadHash: identidadHash,
            wallet: msg.sender,
            ubicacion: Ubicacion({provincia: Provincia(provinciaId), cantonId: cantonId}),
            tipoSeparador: tipoSeparador,
            activo: true,
            registradoEn: uint64(block.timestamp)
        });
        identidadHashToWallet[identidadHash] = msg.sender;

        emit SeparadorRegistrado(msg.sender, identidadHash, tipoSeparador);
    }

    function registrarIntermediario(
        bytes32 nombreHash,
        bytes32 cedulaHash,
        uint8   provinciaId,
        uint8   cantonId,
        uint8   subtipo
    ) external override {
        require(!_tieneAlgunRol(msg.sender), "La wallet ya tiene un rol asignado");
        require(identidadHashToWallet[cedulaHash] == address(0), "Identidad ya registrada");
        require(provinciaId <= uint8(type(Provincia).max), "Provincia invalida");

        intermediarios[msg.sender] = Intermediario({
            nombreHash: nombreHash,
            cedulaHash: cedulaHash,
            ubicacion: Ubicacion({provincia: Provincia(provinciaId), cantonId: cantonId}),
            subtipo: subtipo,
            verificado: false,
            activo: true,
            registradoEn: uint64(block.timestamp)
        });
        identidadHashToWallet[cedulaHash] = msg.sender;

        emit IntermediarioRegistrado(msg.sender, nombreHash, subtipo);
    }

    function registrarTransformador(
        bytes32 nombreHash,
        bytes32 cedulaHash,
        uint8   provinciaId,
        uint8   cantonId
    ) external override {
        require(!_tieneAlgunRol(msg.sender), "La wallet ya tiene un rol asignado");
        require(identidadHashToWallet[cedulaHash] == address(0), "Identidad ya registrada");
        require(provinciaId <= uint8(type(Provincia).max), "Provincia invalida");

        transformadores[msg.sender] = Transformador({
            nombreHash: nombreHash,
            cedulaHash: cedulaHash,
            ubicacion: Ubicacion({provincia: Provincia(provinciaId), cantonId: cantonId}),
            verificado: false,
            activo: true,
            registradoEn: uint64(block.timestamp)
        });
        identidadHashToWallet[cedulaHash] = msg.sender;

        emit TransformadorRegistrado(msg.sender, nombreHash);
    }

    function registrarComprador(
        bytes32 nombreHash,
        bytes32 cedulaHash,
        bool    empresaObligadaLey9786
    ) external override {
        require(!_tieneAlgunRol(msg.sender), "La wallet ya tiene un rol asignado");
        require(identidadHashToWallet[cedulaHash] == address(0), "Identidad ya registrada");

        compradores[msg.sender] = Comprador({
            nombreHash: nombreHash,
            cedulaHash: cedulaHash,
            empresaObligadaLey9786: empresaObligadaLey9786,
            activo: true,
            registradoEn: uint64(block.timestamp)
        });
        identidadHashToWallet[cedulaHash] = msg.sender;

        emit CompradorRegistrado(msg.sender, nombreHash, empresaObligadaLey9786);
    }

    function verificarIntermediario(address wallet) external override onlyRole(VERIFIER_ROLE) {
        require(intermediarios[wallet].activo, "Intermediario no existe");
        require(!intermediarios[wallet].verificado, "Ya verificado");
        intermediarios[wallet].verificado = true;
        emit IntermediarioVerificado(wallet, msg.sender);
    }

    function verificarTransformador(address wallet) external override onlyRole(VERIFIER_ROLE) {
        require(transformadores[wallet].activo, "Transformador no existe");
        require(!transformadores[wallet].verificado, "Ya verificado");
        transformadores[wallet].verificado = true;
        emit TransformadorVerificado(wallet, msg.sender);
    }

    // ==== GOBERNANZA OPERATIVA (VERIFIER_ROLE) ====

    function desactivarEntidad(address wallet) external override onlyRole(VERIFIER_ROLE) {
        Rol rol = _rolRegistrado(wallet);
        require(rol != Rol.Ninguno, "Wallet sin rol registrado");
        require(_estaActiva(wallet, rol), "Ya esta desactivada");
        _setActivo(wallet, rol, false);
        emit EntidadDesactivada(wallet, rol, msg.sender);
    }

    function reactivarEntidad(address wallet) external override onlyRole(VERIFIER_ROLE) {
        Rol rol = _rolRegistrado(wallet);
        require(rol != Rol.Ninguno, "Wallet sin rol registrado");
        require(!_estaActiva(wallet, rol), "Ya esta activa");
        _setActivo(wallet, rol, true);
        emit EntidadReactivada(wallet, rol, msg.sender);
    }

    function revocarVerificacion(address wallet) external override onlyRole(VERIFIER_ROLE) {
        Rol rol = _rolRegistrado(wallet);
        if (rol == Rol.Intermediario) {
            require(intermediarios[wallet].verificado, "No esta verificado");
            intermediarios[wallet].verificado = false;
        } else if (rol == Rol.Transformador) {
            require(transformadores[wallet].verificado, "No esta verificado");
            transformadores[wallet].verificado = false;
        } else {
            revert("Solo intermediarios y transformadores se verifican");
        }
        emit VerificacionRevocada(wallet, rol, msg.sender);
    }

    // ==== VISTAS ====

    function esSeparador(address account) external view override returns (bool) {
        return separadores[account].activo;
    }

    function esIntermediarioVerificado(address account) external view override returns (bool) {
        return intermediarios[account].verificado && intermediarios[account].activo;
    }

    function esTransformadorVerificado(address account) external view override returns (bool) {
        return transformadores[account].verificado && transformadores[account].activo;
    }

    function esComprador(address account) external view override returns (bool) {
        return compradores[account].activo;
    }

    /// @notice Rol registrado para la wallet, activa o no. Para saber si puede operar hoy,
    /// usar estaActiva() o los chequeos es*() de arriba.
    function rolDe(address account) external view override returns (Rol) {
        return _rolRegistrado(account);
    }

    function estaActiva(address account) external view override returns (bool) {
        Rol rol = _rolRegistrado(account);
        return rol != Rol.Ninguno && _estaActiva(account, rol);
    }

    // ==== INTERNAS ====

    function _rolRegistrado(address wallet) internal view returns (Rol) {
        if (separadores[wallet].wallet != address(0)) return Rol.Separador;
        if (intermediarios[wallet].cedulaHash != bytes32(0)) return Rol.Intermediario;
        if (transformadores[wallet].cedulaHash != bytes32(0)) return Rol.Transformador;
        if (compradores[wallet].cedulaHash != bytes32(0)) return Rol.Comprador;
        return Rol.Ninguno;
    }

    function _estaActiva(address wallet, Rol rol) internal view returns (bool) {
        if (rol == Rol.Separador) return separadores[wallet].activo;
        if (rol == Rol.Intermediario) return intermediarios[wallet].activo;
        if (rol == Rol.Transformador) return transformadores[wallet].activo;
        if (rol == Rol.Comprador) return compradores[wallet].activo;
        return false;
    }

    function _setActivo(address wallet, Rol rol, bool activo) internal {
        if (rol == Rol.Separador) separadores[wallet].activo = activo;
        else if (rol == Rol.Intermediario) intermediarios[wallet].activo = activo;
        else if (rol == Rol.Transformador) transformadores[wallet].activo = activo;
        else if (rol == Rol.Comprador) compradores[wallet].activo = activo;
    }

    function _tieneAlgunRol(address wallet) internal view returns (bool) {
        return _rolRegistrado(wallet) != Rol.Ninguno;
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
    {}

    /// @dev Reservado para variables de estado de futuras versiones (patron UUPS).
    uint256[50] private __gap;
}
