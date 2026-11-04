// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @notice ERC20 de prueba que imita a USDT (6 decimales) para Polygon Amoy testnet.
/// No usar en mainnet: el faucet es publico y sin restricciones de abuso.
contract MockUSDT is ERC20, Ownable {
    uint256 public constant FAUCET_LIMIT = 10_000 * 10 ** 6; // 10,000 USDT de prueba por llamada

    constructor(address initialOwner) ERC20("Mock Tether USD", "USDT") Ownable(initialOwner) {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    /// @notice Cualquiera puede pedir USDT de prueba para probar el flujo de transacciones pagadas.
    function faucet(uint256 amount) external {
        require(amount <= FAUCET_LIMIT, "Excede el limite del faucet");
        _mint(msg.sender, amount);
    }

    /// @notice Mint controlado por el owner, util para preparar escenarios de test.
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
