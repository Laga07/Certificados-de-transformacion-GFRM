# Arquitectura del contrato — DAPP Certificado de Transformación

Estado: **borrador para revisión — todavía no hay una sola línea de Solidity nueva escrita.**
Este documento traduce el "Resumen ejecutivo... Certificado de Transformación" (el PDF dirigido
al Ministerio de Salud) a decisiones de implementación concretas. Donde el PDF deja algo abierto
a propósito (precio, naturaleza jurídica, protección de datos), este documento tampoco lo cierra
— son temas legales/de negocio, no de ingeniería.

Alcance acordado: **completo** (los 5 materiales, los 5 roles, linaje de lotes, cascada de merma
con piso en cero) y con **rigor de producto real** (no custodia de fondos desde el diseño,
reentrancy guards, pausable, pensado para eventualmente auditarse) aunque el despliegue siga en
testnet por ahora.

---

## 1. Qué se reutiliza de DAPP Plástico Tesis

| Patrón | De dónde | Por qué se mantiene |
|---|---|---|
| Un solo rol por wallet (`_tieneAlgunRol`) | `RegistroEntidades` | Es literalmente la regla del documento ("cada organización participa con un solo rol"); además evita auto-asignación en ambos extremos de una transacción. |
| Conciliación de ruta municipal contra báscula | `LoteMunicipal` / `tipoReconciliadoDeLote` | Es la Tabla 7 del documento, ya resuelta. Se generaliza a cualquier intermediario, no solo municipalidad. |
| Catálogo como lista append-only (uint8 sin enum on-chain para campos que ya vimos crecer) | `TIPOS_VIVIENDA` en el frontend | El catálogo de materiales y el de "tipo de separador" van a crecer (el propio PDF dice "el catálogo puede ampliarse sin cambiar el funcionamiento"). Para los campos que SÍ necesitan validación on-chain dura (rol, material soportado) usamos enum real; para sub-clasificaciones de reporting (variante, sub-tipo de intermediario) usamos el patrón libre. |
| `ReentrancyGuardTransient`, `pause()/unpause()`, `__gap` en upgradeables | Todo el contrato actual | Igual de necesario aquí, más todavía por el manejo de USDT. |
| Indexer de eventos → Postgres → API REST | `packages/backend` | El "historial permanente" del PDF (Tabla 13) es, literalmente, la tabla de eventos que ya sabemos indexar. No hay que reinventar esa capa, solo los eventos nuevos. |

## 2. Qué es genuinamente nuevo

### 2.1 Modelo de dos tokens

- **Token de custodia** — representa gramos de un lote físico concreto. El PDF pide ERC-1155.
  **Decisión**: no lo implementamos como un ERC-1155 de transferencia libre. El documento mismo
  dice "no se puede transferir libremente: solo se mueve con el material" — eso choca con la
  semántica estándar de `safeTransferFrom`/`setApprovalForAll`. Vamos a:
  - Heredar `ERC1155Upgradeable` de OpenZeppelin (por compatibilidad de eventos/metadata con
    wallets y exploradores — `TransferSingle`, balance por `(cuenta, loteId)`).
  - Sobrescribir el hook de transferencia (`_update` en OZ v5) para que **revierta** si quien
    llama no es el propio contrato de lógica — es decir, no existe transferencia "libre"; el
    balance solo cambia a través de nuestras funciones controladas (acuñar en la entrega, mover
    en el traspaso de dos pasos, quemar al unir/transformar).
  - `tokenId = loteId` (no el material — cada lote físico es su propio id; el material es un
    campo del struct del lote, no el id del token).

- **Certificado de Transformación** — el PDF pide ERC-20, uno **distinto por material** (Tabla 3
  y 6.4). Tomado literalmente: **5 contratos ERC-20 separados** (uno por material del catálogo),
  no un solo contrato multi-material. Para que el catálogo pueda crecer sin redesplegar el
  contrato núcleo cada vez (promesa explícita del PDF, pág. 13):
  - Un contrato núcleo (`CertificadoTransformacion`) es el único que puede mintear/quemar.
  - Cada material tiene su propio token ERC-20 desplegado como **minimal proxy (clone)** del
    mismo implementation contract — agregar un material nuevo = desplegar un clone más
    (barato), no una migración.
  - Símbolos propuestos: `CERT-PLAST`, `CERT-CART`, `CERT-TETRA`, `CERT-VIDRIO`, `CERT-METAL`.

### 2.2 Por qué la "primera venta" no puede ser una transferencia ERC-20 simple

Este es el punto más delicado del documento y vale la pena explicarlo en detalle porque cambia
la forma de la función de venta.

El reparto (35/20/30/15 + cascada de merma) depende de **de qué lotes salió** el certificado —
pero un ERC-20 es fungible por diseño: una vez que 9,506 certificados están acuñados, un token
es indistinguible de otro. Si repartiéramos en cada transferencia, perderíamos la trazabilidad
exacta de qué separadores/intermediarios corresponde pagar.

La salida que usa el propio documento (sin decirlo explícitamente) es que el reparto ocurre
**una sola vez, en la primera venta** (Tabla 9: "Después de la primera venta, el certificado
puede revenderse... libremente" — ninguna mención de reparto en reventas). Eso implica:

1. Al transformar, el contrato no solo acuña el ERC-20 — también guarda un registro interno
   **`LoteDeEmision`** (por evento de transformación) con: lotes consumidos, kg transformados,
   lista de separadores×kg de origen, lista de intermediarios que participaron, el
   transformador, y la merma de cada eslabón. Los tokens recién acuñados quedan en una
   "tenencia primaria" ligada a ese `LoteDeEmision`, en manos del transformador.
2. La función de venta primaria **no es un `transfer()` normal**: es
   `venderPrimario(loteEmisionId, cantidadKg, precioUSDTporKg)`. Ahí, y solo ahí, el contrato
   calcula el reparto usando los datos guardados en `LoteDeEmision`, hace el `transferFrom` de
   USDT del comprador y **empuja** cada parte a su destinatario en la misma transacción
   (ver 2.3), y por último transfiere los `cantidadKg` tokens ERC-20 al comprador.
3. Desde ese momento, esos tokens ya son ERC-20 corrientes: el comprador los revende o conserva
   con un `transfer()` normal, sin lógica de reparto ni de merma — exactamente lo que pide la
   Tabla 9.

Esto también acota el costo de gas de forma razonable: el linaje completo (qué separador aportó
qué) se guarda **una vez por lote de emisión** (uno por evento de transformación), no una vez
por kilogramo ni una vez por certificado individual.

### 2.3 "Green Foot no custodia fondos de terceros" como restricción de diseño

Página 16 del documento. Implica que `venderPrimario` no puede acumular un balance de USDT que
el contrato "retenga" para repartir después — tiene que empujar las 4-5 transferencias de USDT
(separadores, intermediarios, transformador, plataforma) **dentro de la misma transacción** que
recibe el pago del comprador. Funcionalmente:

```
function venderPrimario(loteEmisionId, cantidadKg, precioUSDTporKg):
    requiere: cantidadKg <= disponible(loteEmisionId)
    valorTotal = cantidadKg * precioUSDTporKg
    reparto = calcularReparto(loteEmisionId, cantidadKg, valorTotal)   // ver 2.4

    USDT.transferFrom(comprador, address(this), valorTotal)
    for (destinatario, monto) in reparto:
        if monto > 0: USDT.transfer(destinatario, monto)
    // si "reparto" consolida varios separadores en un solo pago mensual (pág. 15-16),
    // esa consolidación es tarea del indexer/backend, no del contrato -- el contrato
    // siempre paga a cada wallet individual en el momento de la venta.

    certificadoERC20[material].transfer(comprador, cantidadKg)
    marcarVendido(loteEmisionId, cantidadKg)
    emit VentaPrimaria(loteEmisionId, comprador, cantidadKg, valorTotal, reparto)
```

Si una de las transferencias de USDT falla (ej. un separador con wallet que rechaza, poco
probable con USDT pero hay que contemplarlo), **toda la transacción revierte** — no hay reparto
parcial. Esto es más estricto que lo que pide el documento, pero es la única forma honesta de
cumplir "no custodia fondos" sin introducir un patrón pull-payment con balances pendientes (que
sí sería una forma de custodia).

### 2.4 Cascada de merma + piso en cero + faltante — algoritmo

Por cada `LoteDeEmision`, además de separadores×kg e intermediarios, se guarda la merma de cada
**eslabón que puede generar merma**: cada intermediario individual + el transformador (los
separadores nunca generan merma — pág. 12, su parte se calcula sobre lo aceptado en origen).

```
valorTotal = cantidadKg_vendida * precio
baseSeparadores   = 0.35 * valorTotal   // repartido pro-rata por kg entre separadores
baseIntermediarios = 0.20 * valorTotal  // repartido en partes iguales entre intermediarios
                                          // (100% a plataforma si no hubo intermediarios -- pág. 15)
baseTransformador = 0.30 * valorTotal
plataforma        = 0.15 * valorTotal   // fijo, nunca se reduce, nunca cubre faltante

faltanteTotal = 0
para cada eslabón E en (intermediarios individuales + transformador):
    perdidaValor_E = E.kgPerdidos * precio
    si perdidaValor_E <= E.baseShare:
        E.shareFinal = E.baseShare - perdidaValor_E
    si no:
        E.shareFinal = 0
        faltanteTotal += perdidaValor_E - E.baseShare

si faltanteTotal > 0:
    otros = (separadores como UN grupo) + (cada intermediario SIN faltante) + (transformador SI no generó el faltante)
    porCada = faltanteTotal / count(otros)
    separadores.shareFinal -= porCada   // y se sub-reparte entre ellos pro-rata por kg
    cada intermediario en otros: .shareFinal -= porCada
    si transformador en otros: transformador.shareFinal -= porCada
```

**Caso borde que el documento no cubre y necesito que confirmes antes de codear**: ¿qué pasa si
*dos* eslabones generan faltante en el mismo lote de emisión (ej. un intermediario Y el
transformador ambos pierden más de lo que les tocaba)? El ejemplo del documento (pág. 15) solo
cubre un eslabón en falta. Dos lecturas razonables:
  - (a) cada faltante se reparte por separado, secuencialmente, entre los que en ESE momento
    sigan con `shareFinal > 0`, o
  - (b) se suman ambos faltantes y se reparten juntos entre quien quede con `shareFinal > 0`
    después de aplicar ambos pisos en cero.
  (a) y (b) dan resultados distintos cuando el total de faltantes es grande. Voy a asumir (b)
  (más simple, un solo pase) salvo que me digas lo contrario.

### 2.5 Roles

```
enum Rol { Ninguno, Separador, Intermediario, Transformador, Comprador }
```

- **Separador**: generaliza `Usuario`. Campo `tipoSeparador` (libre/append-only, como hoy
  `tipoVivienda`): Hogar, Comercio, Industria, Institución, **Recuperador Inclusivo**. Esto ya
  casi existe — "Recuperadores Inclusivos" se agregó a `TIPOS_VIVIENDA` en DAPP Plástico Tesis
  esta misma semana; aquí se vuelve un valor de primera clase con el mismo patrón.
- **Intermediario**: generaliza `CentroRecolector` + `Municipalidad`. Campo `subtipo` libre
  (Recolector, Centro de acopio, Municipalidad/ruta selectiva, Compactador, Transportista) —
  mismo patrón que `tipoSeparador`, solo para reporting, sin efecto en la lógica de reparto
  (todos los intermediarios de un lote se reparten el 20% en partes iguales, sin importar el
  subtipo).
- **Transformador** (nuevo): registra transformaciones, recibe certificados primarios.
- **Comprador** (nuevo): compra certificados, los retira al usarlos en un informe. Campo
  `empresaObligadaLey9786: bool` (solo para reporting/analítica, no cambia el flujo).
- `_tieneAlgunRol` se extiende a los 5 roles, sin cambios de fondo.

### 2.6 Catálogo de materiales

```
enum Material { Plastico, CartonPapel, Tetrapack, Vidrio, Metales }
```
Enum real (no libre) porque el material determina a qué contrato ERC-20 de certificado y a qué
token de custodia afecta — necesita validación on-chain dura. **Append-only**: agregar un
material nuevo es agregar un valor al final del enum + desplegar su clone de certificado: no
rompe nada existente, pero sí requiere un upgrade del contrato núcleo (a diferencia de la
variante, que es libre/string y no necesita upgrade). Variantes (PET/PEAD/... para plástico,
periódico/revistas para cartón, etc.) viajan como string/uint8 libre en el registro de la
entrega — igual que hoy `TipoPlastico`, generalizado.

### 2.7 Lotes: unión, división, traspaso en dos pasos

- **Unión** (Figura 3): se queman los `loteId` de origen, se acuña un `loteId` nuevo. El
  **linaje proporcional no se guarda recalculado on-chain** (sería caro y no hace falta): el
  evento `LoteUnido(nuevoLoteId, loteIdsOrigen[], pesosOrigen[])` es suficiente — cualquiera
  puede reconstruir las proporciones desde el log inmutable, y es el indexer quien las
  materializa en Postgres para que la API las sirva ya calculadas. Esto es consistente con cómo
  ya funciona el resto del "historial permanente" del documento (Tabla 13): vive en eventos +
  Postgres, no en storage on-chain redundante.
- **División**: misma lógica, inversa.
- **Traspaso en dos pasos** (5.4): `declararEnvio(loteId, pesoEnviado, precio)` por quien envía,
  luego `confirmarRecepcion(loteId, pesoRecibido, quienAbsorbeDiferencia)` por quien recibe.
  Sin el segundo paso, el lote no cambia de custodia — coincide con la nota al pie de la Figura
  3. Generaliza el flujo que hoy ya existe para lotes municipales a cualquier intermediario.

### 2.8 Eventos nuevos para el indexer

`EntregaRegistrada`, `LoteUnido`, `LoteDividido`, `EnvioDeclarado`, `RecepcionConfirmada`,
`TransformacionRegistrada`, `CertificadoEmitido` (→ crea un `LoteDeEmision`), `VentaPrimaria`,
`CertificadoRetirado` (quema + referencia a empresa/informe/período). Todos con los campos que
pide la Tabla 13 del documento. El schema de Prisma se extiende con tablas espejo de cada uno —
mismo patrón que ya existe para `Transaccion`/`MunicipalBatch`.

## 3. Explícitamente fuera de la Fase 1

El propio documento los marca como complemento, no núcleo — no bloquean un primer contrato
funcional:

- Oráculos de pesaje (báscula inteligente / cámaras) — Anexo A.
- Verificación por muestreo como proceso — Anexo B (sí dejamos el balance de material/certificados
  consultable on-chain para que una auditoría futura tenga de dónde partir, pero el *proceso* de
  auditoría en sí es operativo, no de contrato).
- Conversión USDT→colones y alianza con proveedor VASP (pág. 16) — fuera del contrato por
  definición.
- Todo lo de la sección 11 (naturaleza jurídica, admisibilidad Ley 9786, Ley 8968) — temas
  legales, no bloquean escribir el contrato, pero sí van a bloquear operar con dinero/personas
  reales.

## 4. Decisiones que necesito que confirmes antes de escribir Solidity

1. El caso borde 2.4 (doble faltante en un mismo lote de emisión) — ¿asumo la lectura (b)?
2. ¿El "precio por certificado" en `venderPrimario` lo fija el transformador libremente por
   ahora (precio libre, una de las 3 opciones que el propio documento deja abiertas en la
   sección 10), o querés dejar un punto de extensión para fijarlo por gobernanza/admin más
   adelante? Para Fase 1 propongo precio libre fijado por quien vende — es lo más simple y es
   coherente con "tema abierto" del documento.
3. ¿`Comprador` necesita poder comprar sin registrarse primero (solo con USDT + wallet), o
   también debe pasar por `RegistroEntidades` como los demás roles? Propongo que sí se registre
   (nombre de empresa + flag Ley 9786) porque el retiro de certificado necesita esa identidad
   para el informe de cumplimiento — pero es tu decisión de producto, no mía.

Cuando confirmes estos 3 puntos (o digas "seguí con lo que proponés"), el siguiente paso es
escribir el contrato (`packages/contracts/contracts/`) siguiendo este documento, con su propia
suite de tests de Hardhat — especialmente para 2.3 y 2.4, que son donde más fácil es introducir
un bug con dinero real de por medio.
