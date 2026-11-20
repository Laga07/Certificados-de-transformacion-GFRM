#!/usr/bin/env bash
# Preparacion inicial de un VPS Ubuntu 24.04 recien creado. Se corre UNA vez, como root:
#
#   curl -fsSL https://raw.githubusercontent.com/Laga07/Certificados-de-transformacion-GFRM/main/deploy/setup-servidor.sh | bash
#
# Deja: usuario "deploy" con sudo y tu llave SSH, firewall (solo 22/80/443), Docker,
# actualizaciones de seguridad automaticas, swap de 2 GB, el repo clonado en /opt/certificado
# y el cron de respaldos diarios. No levanta la app: eso se hace despues de completar
# deploy/.env.prod (ver docs/despliegue.md).
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/Laga07/Certificados-de-transformacion-GFRM.git}"
APP_DIR=/opt/certificado
DEPLOY_USER=deploy

if [[ $EUID -ne 0 ]]; then
  echo "Correr como root." >&2
  exit 1
fi

echo "==> Paquetes base y actualizaciones de seguridad automaticas"
apt-get update
DEBIAN_FRONTEND=noninteractive apt-get -y upgrade
DEBIAN_FRONTEND=noninteractive apt-get -y install ca-certificates curl git ufw fail2ban unattended-upgrades
dpkg-reconfigure -f noninteractive unattended-upgrades

echo "==> Swap de 2 GB (el build de Next.js necesita memoria en un VPS de 2-4 GB)"
if ! swapon --show | grep -q /swapfile; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "==> Docker (repositorio oficial)"
if ! command -v docker >/dev/null; then
  curl -fsSL https://get.docker.com | sh
fi

echo "==> Usuario $DEPLOY_USER"
if ! id "$DEPLOY_USER" >/dev/null 2>&1; then
  adduser --disabled-password --gecos "" "$DEPLOY_USER"
  usermod -aG sudo,docker "$DEPLOY_USER"
  echo "$DEPLOY_USER ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/90-$DEPLOY_USER
  mkdir -p /home/$DEPLOY_USER/.ssh
  # Reutiliza la llave SSH con la que entraste como root.
  cp /root/.ssh/authorized_keys /home/$DEPLOY_USER/.ssh/authorized_keys
  chown -R $DEPLOY_USER:$DEPLOY_USER /home/$DEPLOY_USER/.ssh
  chmod 700 /home/$DEPLOY_USER/.ssh && chmod 600 /home/$DEPLOY_USER/.ssh/authorized_keys
fi

echo "==> SSH: sin contrasenas ni login de root"
sed -i -E 's/^#?PasswordAuthentication .*/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i -E 's/^#?PermitRootLogin .*/PermitRootLogin no/' /etc/ssh/sshd_config
systemctl reload ssh || systemctl reload sshd

echo "==> Firewall: solo SSH, HTTP y HTTPS"
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 443/udp
ufw --force enable

echo "==> Repo en $APP_DIR"
if [[ ! -d $APP_DIR/.git ]]; then
  git clone "$REPO_URL" "$APP_DIR"
fi
chown -R $DEPLOY_USER:$DEPLOY_USER "$APP_DIR"
mkdir -p /var/backups/certificado && chown $DEPLOY_USER:$DEPLOY_USER /var/backups/certificado

echo "==> Respaldo diario de la base a las 03:15"
cat > /etc/cron.d/certificado-backup <<CRON
15 3 * * * $DEPLOY_USER cd $APP_DIR && ./deploy/backup.sh >> /var/log/certificado-backup.log 2>&1
CRON
touch /var/log/certificado-backup.log && chown $DEPLOY_USER:$DEPLOY_USER /var/log/certificado-backup.log

cat <<FIN

Listo. Siguiente paso (como $DEPLOY_USER):
  ssh $DEPLOY_USER@<ip-del-servidor>
  cd $APP_DIR
  cp deploy/.env.prod.example deploy/.env.prod && nano deploy/.env.prod
  ./deploy/deploy.sh

Desde ahora entra con "ssh $DEPLOY_USER@<ip>": el login de root quedo deshabilitado.
FIN
