import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import hre, { network } from "hardhat";
import { upgrades } from "@openzeppelin/hardhat-upgrades";

// Catalogo inicial de materiales (Material enum en TiposComunes.sol) -- orden fijo, append-only.
const MATERIALES = [
  { indice: 0, nombre: "Certificado Plastico", simbolo: "CERT-PLAST" },
  { indice: 1, nombre: "Certificado Carton y Papel", simbolo: "CERT-CART" },
  { indice: 2, nombre: "Certificado Tetrapack", simbolo: "CERT-TETRA" },
  { indice: 3, nombre: "Certificado Vidrio", simbolo: "CERT-VIDRIO" },
  { indice: 4, nombre: "Certificado Metales", simbolo: "CERT-METAL" },
];

async function main() {
  const connection = await network.create();
  const { ethers } = connection;
  const upgradesApi = await upgrades(hre, connection);

  const [deployer] = await ethers.getSigners();
  console.log(`Desplegando en la red "${connection.networkName}" con la cuenta ${deployer.address}`);

  // 1) MockUSDT (no upgradeable, solo para testnet)
  const MockUSDT = await ethers.getContractFactory("MockUSDT");
  const usdt = await MockUSDT.deploy(deployer.address);
  await usdt.waitForDeployment();
  const usdtAddress = await usdt.getAddress();
  console.log(`MockUSDT desplegado en ${usdtAddress}`);

  // 2) RegistroEntidades (proxy UUPS)
  const RegistroEntidades = await ethers.getContractFactory("RegistroEntidades");
  const registro = await upgradesApi.deployProxy(RegistroEntidades, [deployer.address]);
  await registro.waitForDeployment();
  const registroAddress = await registro.getAddress();
  console.log(`RegistroEntidades (proxy) desplegado en ${registroAddress}`);

  // 3) TokenCustodia (proxy UUPS)
  const TokenCustodia = await ethers.getContractFactory("TokenCustodia");
  const tokenCustodia = await upgradesApi.deployProxy(TokenCustodia, [deployer.address, registroAddress]);
  await tokenCustodia.waitForDeployment();
  const tokenCustodiaAddress = await tokenCustodia.getAddress();
  console.log(`TokenCustodia (proxy) desplegado en ${tokenCustodiaAddress}`);

  // 4) CertificadoTransformacion -- implementacion unica que se clona por material (EIP-1167).
  // No es un proxy UUPS: es la plantilla que MercadoCertificados.desplegarCertificado() clona.
  const CertificadoTransformacion = await ethers.getContractFactory("CertificadoTransformacion");
  const certificadoImpl = await CertificadoTransformacion.deploy();
  await certificadoImpl.waitForDeployment();
  const certificadoImplAddress = await certificadoImpl.getAddress();
  console.log(`CertificadoTransformacion (implementacion para clones) desplegado en ${certificadoImplAddress}`);

  // 5) MercadoCertificados (proxy UUPS)
  const MercadoCertificados = await ethers.getContractFactory("MercadoCertificados");
  const mercado = await upgradesApi.deployProxy(MercadoCertificados, [
    deployer.address,
    registroAddress,
    tokenCustodiaAddress,
    usdtAddress,
    certificadoImplAddress,
    deployer.address, // plataforma: por ahora la wallet del deployer: cambiar antes de operar con fondos reales
  ]);
  await mercado.waitForDeployment();
  const mercadoAddress = await mercado.getAddress();
  console.log(`MercadoCertificados (proxy) desplegado en ${mercadoAddress}`);

  // 6) Wiring de roles: sin esto, MercadoCertificados no puede consumir lotes al transformar.
  const MERCADO_ROLE = await tokenCustodia.MERCADO_ROLE();
  const wireTx = await tokenCustodia.connect(deployer).grantRole(MERCADO_ROLE, mercadoAddress);
  await wireTx.wait();
  console.log(`MERCADO_ROLE otorgado a MercadoCertificados (${mercadoAddress}) en TokenCustodia`);

  // 7) Desplegar el clone de certificado para cada material del catalogo inicial.
  const direccionesCertificados: Record<string, string> = {};
  for (const material of MATERIALES) {
    const tx = await mercado.connect(deployer).desplegarCertificado(material.indice, material.nombre, material.simbolo);
    const receipt = await tx.wait();
    const evento = receipt?.logs
      .map((log: any) => {
        try {
          return mercado.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((parsed: any) => parsed?.name === "CertificadoDesplegado");
    const cloneAddress = evento?.args?.clone as string;
    direccionesCertificados[material.simbolo] = cloneAddress;
    console.log(`Certificado ${material.simbolo} (material ${material.indice}) desplegado en ${cloneAddress}`);
  }

  const deploymentBlock = await ethers.provider.getBlockNumber();

  const output = {
    network: connection.networkName,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployer: deployer.address,
    startBlock: deploymentBlock,
    contracts: {
      MockUSDT: { address: usdtAddress },
      RegistroEntidades: { address: registroAddress },
      TokenCustodia: { address: tokenCustodiaAddress },
      CertificadoTransformacionImpl: { address: certificadoImplAddress },
      MercadoCertificados: { address: mercadoAddress },
      Certificados: direccionesCertificados,
    },
  };

  const deploymentsDir = path.join(import.meta.dirname, "..", "deployments");
  await mkdir(deploymentsDir, { recursive: true });
  const outputPath = path.join(deploymentsDir, `${connection.networkName}.json`);
  await writeFile(outputPath, JSON.stringify(output, null, 2));
  console.log(`Direcciones guardadas en ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
