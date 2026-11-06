// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

interface ICertificadoTransformacion {
    function mint(address to, uint256 amount) external;
    function burn(address from, uint256 amount) external;
}

/// @notice Implementacion que MercadoCertificados clona (via OZ `Clones`, EIP-1167) una vez
/// por material del catalogo -- Plastico, CartonPapel, Tetrapack, Vidrio, Metales (ver Tabla
/// 3 y 6.4 del documento: "un certificado distinto para cada material"). Agregar un material
/// nuevo al catalogo es desplegar un clone mas, no redesplegar ni migrar nada existente.
///
/// Un clone (proxy minimo EIP-1167) no puede usar un constructor con argumentos -- todos los
/// clones comparten el mismo bytecode de la implementacion. Por eso hereda de
/// ERC20Upgradeable (patron initializer) aunque este contrato en si no es upgradeable UUPS:
/// si en el futuro hace falta cambiar la logica del certificado, se despliegan clones nuevos
/// de una implementacion nueva -- la logica de negocio real vive en MercadoCertificados, que
/// si es upgradeable.
///
/// 1 token = 1 kg efectivamente transformado, 18 decimales (misma convencion que PlasticoToken
/// en DAPP Plastico Tesis: "1 gramo = 1e18"; aca "1 kg = 1e18").
contract CertificadoTransformacion is Initializable, ERC20Upgradeable {
    /// @notice Unica direccion autorizada a mint/burn -- el contrato MercadoCertificados que
    /// desplego este clone. Nunca el holder, nunca un admin: todo el supply nace y muere a
    /// traves de la logica de emision/retiro de MercadoCertificados.
    address public mercado;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory nombre,
        string memory simbolo,
        address _mercado
    ) external initializer {
        __ERC20_init(nombre, simbolo);
        require(_mercado != address(0), "mercado invalido");
        mercado = _mercado;
    }

    modifier soloMercado() {
        require(msg.sender == mercado, "Solo MercadoCertificados puede mint/burn");
        _;
    }

    function mint(address to, uint256 amount) external soloMercado {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external soloMercado {
        _burn(from, amount);
    }
}
