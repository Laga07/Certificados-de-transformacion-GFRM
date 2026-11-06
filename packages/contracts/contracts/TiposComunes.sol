// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

// Tipos compartidos entre contratos. Separados en su propio archivo (a diferencia de
// PlasticExchange.sol en DAPP Plastico Tesis, que los declaraba inline) porque aca varios
// contratos distintos -- RegistroEntidades, TokenCustodia, MercadoCertificados -- necesitan
// el mismo enum sin depender uno del otro.

enum Rol { Ninguno, Separador, Intermediario, Transformador, Comprador }

// Enum real (no libre) a proposito: el material determina a que contrato ERC20 de
// certificado y a que acumulador de custodia afecta una operacion -- necesita validacion
// on-chain dura. Append-only: un material nuevo se agrega al final (requiere upgrade del
// contrato nucleo + desplegar su clone de certificado), nunca se inserta en medio.
// Las VARIANTES de cada material (PET/PEAD/... para Plastico, Periodico/Revistas para
// CartonPapel, etc.) son libres (uint8 sin enum on-chain, catalogo real en el frontend) --
// ver docs/arquitectura-certificado-transformacion.md seccion 2.6.
enum Material { Plastico, CartonPapel, Tetrapack, Vidrio, Metales }

enum ModalidadEntrega { SinPago, ConPago, RutaMunicipal }

// En un traspaso de dos pasos, si el peso recibido no coincide con el enviado, las partes
// eligen quien absorbe la diferencia (ver TokenCustodia.confirmarRecepcion).
enum QuienAbsorbe { Envia, Recibe, Mitad }
