import { network } from "hardhat";
import { keccak256, toUtf8Bytes } from "ethers";

async function main() {
  const connection = await network.create();
  const { ethers } = connection;
  const [admin, usuario1, centro, municipalidad] = await ethers.getSigners();

  const deployment = await import("../deployments/localhost.json", { with: { type: "json" } }).then(
    (m) => m.default,
  );

  const registro = await ethers.getContractAt(
    "RegistroEntidades",
    deployment.contracts.RegistroEntidades.address,
  );
  const transacciones = await ethers.getContractAt(
    "TransaccionesPlastico",
    deployment.contracts.TransaccionesPlastico.address,
  );

  await registro
    .connect(usuario1)
    .registrarUsuario(keccak256(toUtf8Bytes("cedula-smoke-1")), 0, 1, 100, 0);
  console.log("Usuario registrado");

  await registro
    .connect(centro)
    .registrarCentroRecolector(
      keccak256(toUtf8Bytes("Centro Smoke")),
      keccak256(toUtf8Bytes("cedula-juridica-smoke")),
      0,
      1,
      200,
      2,
      true,
    );
  await registro.connect(admin).verificarCentro(centro.address);
  console.log("Centro registrado y verificado");

  await registro
    .connect(admin)
    .registrarMunicipalidad(municipalidad.address, keccak256(toUtf8Bytes("Muni Smoke")));
  console.log("Municipalidad registrada");

  await transacciones
    .connect(centro)
    .registrarTransaccionGratuita(usuario1.address, 500n, 0, 1);
  console.log("Transaccion gratuita registrada");

  await transacciones.connect(municipalidad).iniciarLoteMunicipal(1_700_000_000n, 1);
  await transacciones
    .connect(municipalidad)
    .registrarEntregaMunicipal(1n, usuario1.address, 800n, 1, 1);
  await transacciones.connect(municipalidad).cerrarLoteMunicipal(1n, 750n);
  console.log("Ciclo de lote municipal completado");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
