# Arquitectura del contrato — DAPP Certificado de Transformación

Estado: **Fase 1 implementada y con tests pasando (39/39)** —
`RegistroEntidades.sol`, `TokenCustodia.sol`, `CertificadoTransformacion.sol` y
`MercadoCertificados.sol` en `packages/contracts/contracts/`. El test de
`comprarCertificado` reproduce el ejemplo numérico exacto de la Tabla 12 del documento
(10,000 kg origen → 3500/1000/800/2706/1500, suma 9506) como regresión. Pendiente: deploy a
Amoy, backend/indexer, frontend.

Este documento traduce el "Resumen ejecutivo... Certificado de Transformación" (el PDF dirigido
al Ministerio de Salud) a decisiones de implementación concretas. Donde el PDF deja algo abierto
a propósito (precio, naturaleza jurídica, protección de datos), este documento tampoco lo cierra
— son temas legales/de negocio, no de ingeniería.

## 0. Ajustes descubiertos al implementar (sobre lo ya confirmado en la sección 4)

- **`registrarEntrega` también acepta a un Transformador verificado como receptor**, no solo
  a un Intermediario. Sin esto, el caso "sin intermediarios" de la Tabla 11 (material directo
  al transformador) era imposible de construir — toda entrega habría necesitado pasar por al
  menos un Intermediario por diseño de los `require`.
- **El 20% de intermediarios sin nadie que lo reclame (0 o 1+ intermediarios con redondeo) se
  suma explícitamente a la plataforma**, no se deja como residuo implícito. El primer intento
  de esto (un `pagoPlataforma` como residuo de `valorTotal`) tenía un bug real: en el caso
  "sin intermediarios" ese 20% simplemente quedaba sin acreditar a nadie (ver commit de tests).
  Ahora `basePlataforma` suma explícitamente ese sobrante y el redondeo de dividirlo entre
  `nIntermediariosReales`.
- Confirmado con un test que fuerza el caso: si el faltante de merma es tan catastrófico que ni
  vaciar por completo el pool de separadores alcanza a cubrirlo, la venta **revierte** (vía un
  `require` de invariante interno) en vez de distribuir mal los fondos o darle un sobrante
  inmerecido a la plataforma. Es un caso extremo (pérdidas por encima de lo que separadores +
  intermediarios + transformador pueden absorber combinados) que el documento no contempla; se
  decidió fallar cerrado antes que inventar una regla no pedida.

Alcance acordado: **completo** (los 5 materiales, los 5 roles, linaje de lotes, cascada de merma
con piso en cero) y con **rigor de producto real** (no custodia de fondos desde el diseño,
reentrancy guards, pausable, pensado para eventualmente auditarse) aunque el despliegue siga en
testnet por ahora.

### 0.1 Gobernanza operativa agregada el 2026-11-13 (plan de producción, A1/A2/A4)

- `RegistroEntidades.desactivarEntidad / reactivarEntidad` (VERIFIER_ROLE): una entidad
  desactivada conserva su registro (la wallet no puede volver a registrarse con otra
  identidad) pero deja de pasar `esSeparador` / `esIntermediarioVerificado` /
  `esTransformadorVerificado` / `esComprador`, así que no puede operar. `rolDe` ahora devuelve
  el rol **registrado** (activa o no); `estaActiva` dice si puede operar hoy.
- `RegistroEntidades.revocarVerificacion` (VERIFIER_ROLE): solo intermediarios y
  transformadores; vuelven al estado "registrado, sin verificar" y pueden verificarse de nuevo.
- `MercadoCertificados.setPlataforma` (admin): cambia el destinatario del 15 % para ventas
  futuras; el saldo ya acreditado a la dirección anterior no se toca.
- `MercadoCertificados.remanenteNoAcreditado` + `rescatarRemanente` (admin): el USDT que la
  cascada de merma no pudo acreditar a nadie (caso extremo de la sección 2.4) se contabiliza
  aparte en vez de quedar como balance anónimo del contrato, y el admin decide a dónde va.
- `registrarTransformacion` lleva `nonReentrant` por consistencia con el resto de funciones
  que mueven tokens.

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
  **Decisión**: no lo implementamos como un ERC-1155 de transferencia libre. El documento mismo dice "no se puede transferir libremente: solo se mueve con el material" — eso choca con la semántica estándar de `safeTransferFrom`/`setApprovalForAll`. Vamos a:
  - Heredar `ERC1155Upgradeable` de OpenZeppelin (por compatibilidad de eventos/metadata con wallets y exploradores 
  — `TransferSingle`, balance por `(cuenta, loteId)`).
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

### 2.3 Custodia de fondos: ledger de saldos pendientes + retiro permissionless

El primer borrador de este documento proponía empujar (`transfer`) el USDT a cada destinatario
dentro de la misma transacción de venta. Pensado para un producto real, ese diseño tiene dos
riesgos serios:

1. **Un solo destinatario puede tumbar el pago de todos los demás.** Un `transfer` que revierte
   revierte toda la transacción. Con USDT esto no es hipotético: Tether tiene una blacklist
   administrada por ellos — si *cualquier* dirección de la cadena de reparto queda ahí alguna
   vez (por cualquier motivo, ajeno a Green Foot), ese pago queda imposible de ejecutar **para
   siempre**, y con él, el de todos los demás participantes de ese lote de emisión.
2. **El número de separadores no tiene techo.** Una ruta municipal agrega material de un barrio
   entero a un solo lote. Un `transfer` por cada uno en un loop hace que el gas de
   `venderPrimario` crezca con el tamaño del lote, hasta superar el límite de gas de un bloque y
   volver la venta imposible de ejecutar — justo lo que un producto que va a escalar no se puede
   permitir.

**Patrón elegido**: el mismo que `PaymentSplitter` de OpenZeppelin (librería auditada, en
producción en miles de contratos) — contabilidad de saldos pendientes, retiro desacoplado de la
venta:

```
function venderPrimario(loteEmisionId, cantidadKg, precioUSDTporKg):
    requiere: cantidadKg <= disponible(loteEmisionId)
    valorTotal = cantidadKg * precioUSDTporKg
    reparto = calcularReparto(loteEmisionId, cantidadKg, valorTotal)   // ver 2.4

    USDT.safeTransferFrom(comprador, address(this), valorTotal)
    for (destinatario, monto) in reparto:
        saldoPendiente[destinatario] += monto     // solo storage, sin llamada externa
    certificadoERC20[material].transfer(comprador, cantidadKg)
    marcarVendido(loteEmisionId, cantidadKg)
    emit VentaPrimaria(loteEmisionId, comprador, cantidadKg, valorTotal, reparto)

// Callable por CUALQUIERA -- el propio destinatario, o un bot del backend de Green Foot
// pagando el gas en nombre de todos, para cumplir "nadie tiene que reclamarlo":
function retirarPago(destinatario):
    monto = saldoPendiente[destinatario]
    requiere: monto > 0
    saldoPendiente[destinatario] = 0          // effects antes de interactions
    USDT.safeTransfer(destinatario, monto)
    emit PagoRetirado(destinatario, monto)
```

Por qué esto sigue siendo "no custodia fondos de terceros" y no un paso atrás: el USDT que
respalda cada `saldoPendiente` vive en el contrato (código neutral, sin discreción humana), no
en una cuenta de Green Foot — cada saldo queda comprometido, público y auditable on-chain desde
el instante de la venta, igual que con push, solo que la entrega final es una llamada aparte.
Es, de hecho, el patrón que la mayoría de protocolos que reparten valor entre muchas direcciones
usan precisamente para poder sostener esa afirmación con seguridad.

Cómo se preserva "nadie tiene que reclamarlo" (pág. 15-16, que de hecho ya proponía un "pago
mensual consolidado"): un job del backend llama `retirarPago()` para cada dirección con saldo
pendiente, en lotes, de forma periódica — paga el gas Green Foot, no el participante. Quien no
quiera esperar puede llamar su propio `retirarPago()` en cualquier momento desde el dashboard.
Un destinatario problemático (blacklisteado, wallet rota) solo bloquea **su propio** retiro,
nunca el de los demás ni la venta en sí.

Detalles que se derivan de esto:
- `retirarPago` lleva `ReentrancyGuardTransient` igual que el resto del contrato, aunque el
  orden checks-effects-interactions ya lo hace seguro por sí solo.
- Todas las transferencias de USDT usan `SafeERC20` de OpenZeppelin (`safeTransfer`/
  `safeTransferFrom`), no la interfaz cruda — protege contra tokens que no devuelven `bool` en
  `transfer` (defecto conocido del USDT original de Ethereum mainnet; el de Polygon no debería
  tenerlo, pero `SafeERC20` lo vuelve indiferente).
- Los porcentajes (35/20/30/15 y la cascada de merma) se calculan en basis points (`/10000`,
  nunca floats) y el redondeo final (la división entera no reparte nunca el 100% exacto) se
  asigna a la **plataforma** — único destinatario de cardinalidad 1 en toda la operación, así
  que absorber unos pocos micro-USDT de diferencia ahí es inofensivo y evita fondos huérfanos.

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

**Caso borde resuelto — dos o más eslabones en falta en el mismo lote de emisión** (ej. un
intermediario Y el transformador ambos pierden más de lo que les tocaba): repartir ese faltante
combinado entre "los demás" dejaría un grupo cada vez más chico absorbiendo cada vez más, así
que en vez de eso **se toma directo del grupo de separadores**, pro-rateado entre ellos por kg —
el mismo piso en cero aplica ahí (un separador nunca queda en negativo; si el faltante superara
incluso toda la parte de los separadores, el contrato deja esa porción sin cubrir en vez de
inventar una regla no pedida — sería señal de que ese lote no debió venderse a ese precio).

```
si count(eslabonesConFaltante) == 1:
    // regla documentada (pag. 15): reparte entre separadores + demas intermediarios + transformador
    repartirEntreOtros(faltanteTotal)
si no:  // 2+ eslabones en falta
    repartirSoloEntreSeparadores(faltanteTotal)   // pro-rata por kg, con piso en cero
```

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
variante, que es libre/string y no necesita upgrade).

Variantes: cada material tiene su **propio catálogo de sub-tipos**, libre/append-only igual que
hoy `TipoPlastico` (uint8 sin enum on-chain, catálogo real vive en el frontend, nunca se
reordena/inserta en el medio) — el documento es explícito en que esto aplica a varios
materiales, no solo a plástico (Tabla 10):

| Material | Catálogo de variantes (orden = índice on-chain) |
|---|---|
| Plástico | PET, PEAD, PVC, PEBD, PP, PS, Otros |
| Cartón y papel | Cartón y papel, Periódico, Revistas |
| Tetrapack | Envases multicapa |
| Vidrio | (sin variantes todavía — catálogo vacío, se agrega si hace falta) |
| Metales | Aluminio en latas, Aluminio en perfiles, Ferrosos, Cobre, Otros no ferrosos |

En el struct de la entrega: `material` (enum, validado on-chain) + `varianteId` (uint8 libre,
su significado depende de `material` — se resuelve contra la tabla de arriba del lado del
frontend/indexer, igual que hoy).

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

## 4. Decisiones confirmadas (2026-11-04)

1. **Doble faltante en un lote de emisión** → se toma del grupo de separadores, pro-rata por kg
   (2.4).
2. **Precio del certificado en `venderPrimario`** → sin objeción, queda como propuse: precio
   libre, fijado por quien vende (transformador), sin mecanismo de gobernanza en Fase 1. Es la
   única de las 3 preguntas originales que no se contestó explícitamente — avisar si en
   realidad se quiere revisar.
3. **Comprador se registra** → sí, vía `RegistroEntidades` igual que los demás roles (2.5).
4. **Custodia de fondos** → ledger de saldos pendientes + `retirarPago` permissionless, no
   push-a-todos en la venta (2.3).
5. **Variantes por material** → cada material tiene su propio catálogo append-only, no solo
   plástico (2.6).

Con esto el diseño de Fase 1 queda cerrado. Sigue escribir el contrato
(`packages/contracts/contracts/`) y su propia suite de tests de Hardhat — particularmente para
2.3 y 2.4, que son donde más fácil es introducir un bug con dinero real de por medio.
