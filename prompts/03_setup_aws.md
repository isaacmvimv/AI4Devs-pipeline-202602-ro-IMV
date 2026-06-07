# Error de flujo de trabajo de github actions

*Exported on 6/7/2026 at 20:07:46 UTC from Cursor (3.6.31)*

---

**User**

Tengo errores el el pipeline de Git Actions al hacer el Deploy en EC2. 

¿Qué debo revisar?

---

**Cursor**

## Qué revisar ahora en la EC2

Conéctate por SSH y comprueba:

```bash
ssh -i tu-clave.pem ubuntu@ec2-13-60-20-224.eu-north-1.compute.amazonaws.com

# ¿Están instalados Node y PM2?
node -v
npm -v
pm2 -v

# ¿Existe el .env?
cat /home/ubuntu/lti-backend/.env

# ¿PostgreSQL responde?
sudo systemctl status postgresql
# o si usas Docker:
docker ps

# Prueba manualmente lo que falló el pipeline:
cd /home/ubuntu/lti-backend
npm ci --omit=dev
npx prisma generate
npx prisma migrate deploy
pm2 start dist/index.js --name lti-backend
```

Los fallos más habituales en este paso:

1. **Node.js o PM2 no instalados** → `npm` o `pm2: command not found`
2. **Falta el `.env`** con `DATABASE_URL` en `/home/ubuntu/lti-backend`
3. **PostgreSQL no está corriendo** → `prisma migrate deploy` falla

Abre el log del paso **"Instalar dependencias y reiniciar aplicación en EC2"** en GitHub Actions; ahí verás el error exacto (por ejemplo `npm: not found` o error de conexión a la base de datos).

¿Puedes pegar ese log? Con eso te digo el fix concreto.

---

**User**

The following task has finished. If you were already aware, ignore this notification and do not restate prior responses.

kind: shell status: success task_id: 682384 title: Check if backend API responds on EC2 port 3010 output_path: C:\Users\IsaacMani\.cursor\projects\c-Users-IsaacMani-Cursor-AI4DEVS-LIDR-Modulo13-AI4Devs-pipeline-202602-ro-IMV-AI4Devs-pipeline-202602-ro-IMV\terminals\682384.txt Briefly inform the user about the task result and perform any follow-up actions (if needed). If there's no follow-ups needed, don't explicitly say that.

---

**Cursor**

La comprobación desde aquí confirma que la API **no está levantada** en la EC2: el puerto **3010** no responde y la petición a `http://13.60.20.224:3010/` hace timeout.

Eso encaja con el fallo del pipeline en el paso **"Instalar dependencias y reiniciar aplicación en EC2"**: el código llegó por SCP, pero la app no arrancó.

Para avanzar, conéctate por SSH a la instancia y ejecuta manualmente en `/home/ubuntu/lti-backend`:

```bash
npm ci --omit=dev
npx prisma generate
npx prisma migrate deploy
pm2 start dist/index.js --name lti-backend
```

Si algo falla ahí (Node/PM2 no instalados, falta `.env`, PostgreSQL parado), ese será el motivo del deploy. Pega el error y lo resolvemos.

---

**User**

Me está dando esto la ejecución de los ocmandos:

ubuntu@ip-172-31-39-99:~~/lti-backend$ node -v
Command 'node' not found, but can be installed with:
sudo apt install nodejs
ubuntu@ip-172-31-39-99:~~/lti-backend$ sudo apt install nodejs
Error: Unable to locate package nodejs
ubuntu@ip-172-31-39-99:~~/lti-backend$
ubuntu@ip-172-31-39-99:~~/lti-backend$
ubuntu@ip-172-31-39-99:~~/lti-backend$
ubuntu@ip-172-31-39-99:~~/lti-backend$ npm -v
Command 'npm' not found, but can be installed with:
sudo apt install npm
ubuntu@ip-172-31-39-99:~~/lti-backend$ sudo apt install npm
Error: Unable to locate package npm
ubuntu@ip-172-31-39-99:~~/lti-backend$ pm2 -v
Command 'pm2' not found, did you mean:
  command 'wm2' from deb wm2 (4+svn20090216-4.1)
  command 'gm2' from deb gm2 (4:15.2.0-5ubuntu1)
  command 'pmg' from deb python3-pymatgen (2025.10.7+dfsg1-1ubuntu2)
  command 'tpm2' from deb tpm2-tools (5.7-1build1)
  command 'pmc' from deb linuxptp (4.4-0ubuntu1)
  command 'pmw' from deb pmw (1:5.22-1build1)
  command 'pm' from deb powerman (2.4.4-5build1)
  command 'pms' from deb pms (0.42-2)
  command 'pom2' from deb libpod-pom-perl (2.01-4)
Try: sudo apt install 
ubuntu@ip-172-31-39-99:~~/lti-backend$ cat /home/ubuntu/lti-backend/.env
DB_USER=LTIdbUser
DB_PASSWORD=D1ymf8wyQEGthFR1E9xhCq
DB_NAME=LTIdb
DB_PORT=5432
DATABASE_URL=postgresql://LTIdbUser:D1ymf8wyQEGthFR1E9xhCq@localhost:5432/LTIdb
ubuntu@ip-172-31-39-99:~~/lti-backend$
ubuntu@ip-172-31-39-99:~~/lti-backend$
ubuntu@ip-172-31-39-99:~~/lti-backend$ sudo systemctl status postgresql
Unit postgresql.service could not be found.
ubuntu@ip-172-31-39-99:~~/lti-backend$
ubuntu@ip-172-31-39-99:~~/lti-backend$
ubuntu@ip-172-31-39-99:~~/lti-backend$ docker ps
Command 'docker' not found, but can be installed with:
sudo snap install docker         # version 29.3.1, or
sudo apt  install docker.io      # version 29.1.3-0ubuntu4
sudo apt  install podman-docker  # version 5.7.0+ds2-3build1
See 'snap info docker' for additional versions.
ubuntu@ip-172-31-39-99:~~/lti-backend$

---

**Cursor**

La EC2 está bien configurada en el `.env`, pero **faltan las dependencias del sistema**. Por eso falló el deploy: no hay Node, PM2 ni PostgreSQL.

Ejecuta esto **en la EC2**, en orden:

## 1. Actualizar paquetes

```bash
sudo apt update
sudo apt upgrade -y
```

## 2. Instalar Node.js 20 (el pipeline usa la v20)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Comprueba:

```bash
node -v    # debe mostrar v20.x
npm -v
```

## 3. Instalar PM2

```bash
sudo npm install -g pm2
pm2 -v
```

## 4. Instalar PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql
sudo systemctl status postgresql
```

## 5. Crear usuario y base de datos

```bash
sudo -u postgres psql
```

Dentro de `psql`:

```sql
CREATE USER "LTIdbUser" WITH PASSWORD 'D1ymf8wyQEGthFR1E9xhCq';
CREATE DATABASE "LTIdb" OWNER "LTIdbUser";
GRANT ALL PRIVILEGES ON DATABASE "LTIdb" TO "LTIdbUser";
\q
```

## 6. Arrancar la aplicación

```bash
cd /home/ubuntu/lti-backend
npm ci --omit=dev
npx prisma generate
npx prisma migrate deploy
pm2 start dist/index.js --name lti-backend
pm2 save
pm2 startup
```

El último comando (`pm2 startup`) te dará otra línea para copiar y pegar con `sudo`.

## 7. Comprobar que funciona

```bash
curl http://localhost:3010/
```

Debería responder: `Hola LTI!`

## 8. Security Group en AWS

Abre el puerto **3010** (además del 22) en el Security Group de la instancia para acceder desde fuera.

---

Cuando todo esto funcione manualmente, **vuelve a lanzar el pipeline** en GitHub (Re-run jobs) y el paso 3 debería completarse solo.

Si algún comando falla, pega el error exacto y lo vemos.

---

**User**

Dime como ejecutar por línea de comandos el punto 5 sin depender del fichero psql externo

---

**Cursor**

Puedes hacerlo todo desde la terminal, sin abrir `psql` de forma interactiva ni usar un fichero `.sql`:

## Opción A — un comando por línea

```bash
sudo -u postgres psql -c "CREATE USER \"LTIdbUser\" WITH PASSWORD 'D1ymf8wyQEGthFR1E9xhCq';"
sudo -u postgres psql -c "CREATE DATABASE \"LTIdb\" OWNER \"LTIdbUser\";"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE \"LTIdb\" TO \"LTIdbUser\";"
```

## Opción B — todo en un solo bloque (heredoc)

```bash
sudo -u postgres psql <<'EOF'
CREATE USER "LTIdbUser" WITH PASSWORD 'D1ymf8wyQEGthFR1E9xhCq';
CREATE DATABASE "LTIdb" OWNER "LTIdbUser";
GRANT ALL PRIVILEGES ON DATABASE "LTIdb" TO "LTIdbUser";
EOF
```

## Comprobar que quedó bien

```bash
sudo -u postgres psql -c "\du"
sudo -u postgres psql -c "\l"
```

O probar la conexión con el usuario de la app:

```bash
psql "postgresql://LTIdbUser:D1ymf8wyQEGthFR1E9xhCq@localhost:5432/LTIdb" -c "SELECT 1;"
```

Si devuelve `1`, la base está lista para `npx prisma migrate deploy`.

**Nota:** Si al ejecutar el `CREATE USER` te dice que el usuario ya existe, omite esa línea y ejecuta solo las demás.