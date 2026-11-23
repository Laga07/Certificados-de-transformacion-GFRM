# Despliegue en servidor — DAPP Certificado de Transformación

Guía paso a paso para pasar de "corre en mi PC" a "corre en internet con dominio y HTTPS",
todavía sobre Polygon Amoy. Escrita para hacerse una vez, en orden. Tiempo estimado: 1 a 2
horas, la mayor parte esperando que el DNS propague.

## Cómo queda armado

```
Internet ──► Cloudflare (DNS) ──► VPS Ubuntu
                                   │
                                   └─ Docker Compose
                                       ├─ caddy     :80/:443  HTTPS automático (Let's Encrypt)
                                       │    ├─ /api/*  ──► api      (Fastify)
                                       │    └─ resto   ──► web      (Next.js)
                                       ├─ indexer               lee Polygon Amoy → Postgres
                                       ├─ postgres              solo red interna, nunca expuesto
                                       └─ migrate               corre las migraciones y termina
```

Un solo dominio para todo: el navegador habla con `https://tu-dominio` y Caddy decide si la
petición va a la API o al sitio. Por eso la cookie de sesión funciona sin configurar CORS.

## 1. Comprar (lo hace el dueño del proyecto)

Proveedores elegidos el 2026-11-23 (comparación y precios en la conversación de esa fecha):

| Qué | Proveedor | Costo aprox. |
|---|---|---|
| Dominio `.com` | **Cloudflare Registrar** (precio de costo, igual al renovar, DNS incluido) | 10,44 USD/año |
| Servidor | **Vultr**, Cloud Compute Regular, **4 GB**, región **Miami** | 20 USD/mes + 4 USD respaldos automáticos |
| Correo | **Resend**, plan gratis (3.000/mes, 100/día) | 0 |

### 1.1 Dominio en Cloudflare

1. Crear cuenta en dash.cloudflare.com y agregar un medio de pago.
2. Menú **Domain Registration → Register Domains**, buscar el nombre y comprarlo. La privacidad
   de los datos del dueño (WHOIS) va incluida sin costo.
3. El dominio aparece solo en la cuenta con el DNS de Cloudflare ya activo.

### 1.2 Servidor en Vultr

1. Crear cuenta en vultr.com y agregar un medio de pago.
2. **Account → SSH Keys → Add SSH Key**: nombre `certificado`, y pegar el contenido de
   `C:\Users\Usuario\.ssh\certificado_vultr.pub` (una sola línea que empieza con
   `ssh-ed25519`). Es la llave pública: se puede compartir. La privada
   (`certificado_vultr`, sin `.pub`) nunca sale de la PC.
3. **Deploy → Deploy New Server**:
   - Tipo: **Cloud Compute – Shared CPU**, **Regular Performance**.
   - Ubicación: **Miami**.
   - Imagen: **Ubuntu 24.04 LTS x64**.
   - Plan: el de **4 GB** de RAM (2 vCPU, ~20 USD/mes).
   - **Auto Backups: activado** (+20 %). Es una copia de todo el disco, aparte del respaldo
     diario de la base que hace `backup.sh`.
   - SSH Keys: marcar `certificado`.
   - Hostname: `certificado`.
4. Esperar a que quede en "Running" y anotar la **IP** (IPv4) del servidor.

## 2. DNS

En Cloudflare, en el dominio, pestaña DNS:

| Tipo | Nombre | Contenido | Proxy |
|---|---|---|---|
| A | `@` (o el subdominio que elijas, p. ej. `app`) | IP del servidor | **DNS only** (nube gris) |
| A | `www` | IP del servidor | DNS only |

La nube tiene que estar **gris** al principio: Caddy necesita que Let's Encrypt llegue directo
al servidor para emitir el certificado. Una vez que el sitio funcione con HTTPS se puede pasar
a naranja (proxy de Cloudflare); en ese caso, en SSL/TLS elegir modo **Full (strict)**.

Comprobar que propagó (desde tu PC): `nslookup tu-dominio.com` tiene que devolver la IP.

## 3. Preparar el servidor (una vez)

```bash
ssh -i ~/.ssh/certificado_vultr root@<ip>
curl -fsSL https://raw.githubusercontent.com/Laga07/Certificados-de-transformacion-GFRM/main/deploy/setup-servidor.sh | bash
```

Instala Docker, firewall (solo 22/80/443), actualizaciones automáticas de seguridad, swap,
el usuario `deploy`, clona el repo en `/opt/certificado` y programa el respaldo diario.
**Después de esto el login de root queda deshabilitado**: se entra con
`ssh -i ~/.ssh/certificado_vultr deploy@<ip>`.

Las imágenes de Ubuntu de Vultr traen `ufw` activo con solo el puerto 22 abierto; el script
lo deja en 22/80/443. Si además se usa el firewall del panel de Vultr, abrir los mismos tres.

## 4. Configurar

```bash
ssh deploy@<ip>
cd /opt/certificado
cp deploy/.env.prod.example deploy/.env.prod
nano deploy/.env.prod
```

Completar como mínimo `APP_DOMAIN`, `POSTGRES_PASSWORD`, `JWT_SECRET` e `IDENTITY_PEPPER`.
Cada secreto se genera con `openssl rand -hex 32` (uno distinto para cada uno, y distintos a
los de desarrollo). **Guardá una copia de `IDENTITY_PEPPER` fuera del servidor** (gestor de
contraseñas): sin él los hashes de cédula registrados on-chain ya no se pueden reconocer.

## 5. Levantar

```bash
./deploy/deploy.sh
```

La primera vez tarda 5–10 minutos (construye las imágenes). Al terminar imprime la URL. Abrí
`https://tu-dominio`, creá tu cuenta con el correo de `ADMIN_EMAILS` y vas a tener el menú
de Administración.

Comandos útiles (desde `/opt/certificado`):

```bash
alias dc='docker compose --env-file deploy/.env.prod -f docker-compose.prod.yml'
dc ps                      # estado de cada servicio
dc logs -f --tail=100 api  # logs en vivo (api, indexer, web, caddy, postgres)
dc restart indexer         # reiniciar un servicio
dc exec postgres psql -U postgres -d certificado_transformacion   # consola SQL
```

## 6. Correo transaccional

Necesario para verificar cuentas y restablecer contraseñas. Sin configurar, los correos se
escriben en `dc logs api` (sirve para probar, no para usuarios reales). Todas las opciones
exigen **verificar el dominio** en el proveedor (agregar 2–3 registros DNS que te indica): por
eso se configura después de tener el dominio.

| Proveedor | Gratis | Cómo se conecta | Comentario |
|---|---|---|---|
| **Resend** | 3,000/mes, 100/día | `RESEND_API_KEY` | El más simple de configurar |
| **Brevo** (ex Sendinblue) | 300/día | `SMTP_URL=smtp://LOGIN:CLAVE@smtp-relay.brevo.com:587` | El plan gratis más generoso por día |
| SendGrid | 100/día | `SMTP_URL=smtp://apikey:SG.xxx@smtp.sendgrid.net:587` | Muy usado, panel más complejo |
| Amazon SES | ~0.10 USD por 1,000 | SMTP | El más barato a escala; aprobación manual de AWS |
| Gmail | — | SMTP con "contraseña de aplicación" | Solo pruebas: límites bajos y cae en spam |

`MAIL_FROM` tiene que usar el dominio verificado, p. ej.
`Certificado de Transformación <no-responder@tu-dominio.com>`.

### 6.1 Resend (elegido)

1. Crear cuenta en resend.com.
2. **Domains → Add Domain**: escribir el dominio y región **North Virginia (us-east-1)**.
3. Resend muestra 3–4 registros DNS (un MX y TXT para SPF en el subdominio `send`, un TXT
   de DKIM). Con el botón **Auto configure** inicia sesión en Cloudflare y los crea solo; si
   no, copiarlos a mano en Cloudflare → DNS, con la nube **gris**.
4. Agregar también un registro DMARC en Cloudflare (mejora la entrega y evita suplantación):
   TXT, nombre `_dmarc`, contenido `v=DMARC1; p=none; rua=mailto:aaroncaldered@gmail.com`.
5. Esperar a que Resend marque el dominio como **Verified** (minutos a una hora).
6. **API Keys → Create API Key**, permiso **Sending access**, solo para ese dominio. Copiarla
   (se muestra una sola vez) en `deploy/.env.prod` como `RESEND_API_KEY=re_...` y poner
   `MAIL_FROM="Certificado de Transformación <no-responder@tu-dominio.com>"`.
7. `./deploy/deploy.sh` y probar creando una cuenta: tiene que llegar el correo de
   verificación. En Resend → Emails se ve cada envío y si fue entregado.

## 7. Respaldos

El cron diario (03:15) guarda la base y los documentos en `/var/backups/certificado` durante
14 días. Un respaldo que vive en el mismo servidor no sirve si el servidor se pierde, así que
conviene sacar una copia afuera con Cloudflare R2 (10 GB gratis):

1. Cloudflare → R2 → crear bucket `certificado-backups` → crear token de API con permiso de
   escritura sobre ese bucket.
2. En el servidor: `sudo apt install rclone && rclone config` → nuevo remoto llamado `r2`,
   tipo S3, proveedor Cloudflare, con las claves del token.
3. `./deploy/backup.sh` a mano una vez para comprobar que sube.

**Probar una restauración al menos una vez** (es la única forma de saber que el respaldo sirve):

```bash
gunzip -c /var/backups/certificado/db-AAAAMMDD-HHMM.sql.gz | dc exec -T postgres \
  psql -U postgres -d certificado_transformacion
```

Además, los Auto Backups de Vultr (activados al crear el servidor) guardan una imagen de todo
el disco; sirven para volver atrás si el servidor completo se rompe.

## 8. Despliegue automático (opcional)

Con esto, cada push a `main` que pase el CI se despliega solo.

1. En tu PC: `ssh-keygen -t ed25519 -f deploy_key -N ""` (llave exclusiva para GitHub).
2. En el servidor: agregar el contenido de `deploy_key.pub` al final de
   `/home/deploy/.ssh/authorized_keys`.
3. En GitHub → Settings → Secrets and variables → Actions:
   - Secrets: `VPS_HOST` (IP o dominio), `VPS_USER` = `deploy`, `VPS_SSH_KEY` = contenido de
     `deploy_key` (la privada).
   - Variables: `DEPLOY_ENABLED` = `true`.
4. Borrar `deploy_key` de tu PC una vez cargada.

## 9. Monitoreo

- **UptimeRobot** (gratis): dos monitores HTTP cada 5 minutos, `https://tu-dominio` y
  `https://tu-dominio/api/health`, con aviso por correo.
- El indexer atrasado se ve en `/api/health` (`blocksBehind`). Si pasa de unos cientos y no
  baja, revisar `dc logs indexer`: casi siempre es el RPC.

## 10. Al pasar a mainnet

Mismo servidor y mismo procedimiento: deploy nuevo de contratos con USDT real,
`NETWORK_NAME=polygon`, `INDEXER_START_BLOCK` nuevo, base vacía, y quitar los avisos de "red
de prueba" del sitio. Ver la sección A12 de `docs/plan-produccion.md`.
