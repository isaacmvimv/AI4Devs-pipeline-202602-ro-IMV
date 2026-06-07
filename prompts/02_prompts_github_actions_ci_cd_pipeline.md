# GitHub Actions CI/CD pipeline configuration
_Exported on 6/7/2026 at 20:06:53 UTC from Cursor (3.6.31)_

---

**User**

En GitHub hay definidas estos GitHub Secrets que permiten conectarse a una isntancia EC2 de AWS:
AWS_ACCESS_ID
AWS_ACCESS_KEY
EC2_INSTANCE
EC2_SSH_PRIVATE_KEY

Ahora vas a configurar el workflow de GitHub Actions en el archivo .github/workflows/pipeline.yml y servirá para implementar el pipeline CI/CD con estos pasos:

1 - Test: Comprueba que están instaladas las dependencias y ejecuta la suite de tests del backend. Sólo continúa con el siguiente paso si todos los tests pasan correctamente sin errores.
2 - Build: Genera el artefacto de build del backend. Usa `actions/upload-artifact`.
3 - Deploy a EC2: Si el build anterior se ha generado correctamente, descarga el artefacto generado y lo despliegas en la instancia EC2 de AWS mediante SSH usando los secretos de GitHub Actions que hay configurados.

Este pipeline se debe disparar sólo cuando se hac eun "push a una rama con un Pull Request abierto".

Documenta el fichero YAML y cualquier detalle relevante de la implementación.

---

**Cursor**

Revisando la estructura del proyecto y el workflow actual para configurar el pipeline CI/CD.


Creando el workflow completo con jobs secuenciales (test → build → deploy) y documentación en el YAML.


Corrigiendo la expansión de variables en el script SSH remoto.


He configurado el pipeline CI/CD en `.github/workflows/pipeline.yml`. Resumen de la implementación:

## Disparador

El workflow usa el evento `pull_request` con tipos `opened`, `synchronize` y `reopened`. Un **push a la rama del PR** dispara `synchronize`, que es el caso que pedías. No se ejecuta en pushes a ramas sin PR abierto.

## Flujo de jobs (secuencial)

```mermaid
flowchart LR
  A["1 — Test"] --> B["2 — Build"]
  B --> C["3 — Deploy EC2"]
```

Cada job depende del anterior mediante `needs`. Si Test falla, Build y Deploy no se ejecutan.

### 1 — Test
- `npm ci` en `backend/` (comprueba que las dependencias se instalan correctamente)
- Servicio PostgreSQL 15 en el runner, con credenciales alineadas con `schema.prisma`
- `prisma generate` + `prisma migrate deploy`
- `npm test` (unitarios + integración)
- Sube `junit.xml` como artefacto opcional para trazabilidad en CI

### 2 — Build
- Compila con `npm run build` → carpeta `dist/`
- Sube el artefacto `backend-build` con `actions/upload-artifact@v4`:
  - `dist/`, `package.json`, `package-lock.json`, `prisma/`

### 3 — Deploy EC2
- Descarga el artefacto con `actions/download-artifact@v4`
- Configura credenciales AWS (`AWS_ACCESS_ID`, `AWS_ACCESS_KEY`)
- Configura SSH con `EC2_SSH_PRIVATE_KEY` y conecta a `EC2_INSTANCE`
- Transfiere el artefacto por **SCP** a `/home/ec2-user/lti-backend`
- En remoto: `npm ci --omit=dev`, `prisma generate`, `prisma migrate deploy`, reinicio con **PM2**

## Secretos requeridos

| Secreto | Uso |
|---------|-----|
| `AWS_ACCESS_ID` | Access Key ID (configure-aws-credentials) |
| `AWS_ACCESS_KEY` | Secret Access Key |
| `EC2_INSTANCE` | IP pública o DNS de la instancia |
| `EC2_SSH_PRIVATE_KEY` | Clave PEM completa para SSH |

## Prerrequisitos en EC2

Antes del primer despliegue, en la instancia:

```bash
# Node.js 20+, PM2, directorio de despliegue
sudo npm install -g pm2
mkdir -p /home/ec2-user/lti-backend

# .env con DATABASE_URL (no se incluye en el artefacto por seguridad)
echo 'DATABASE_URL=postgresql://...' > /home/ec2-user/lti-backend/.env
```

Si usas **Ubuntu** en lugar de Amazon Linux, cambia `EC2_SSH_USER` de `ec2-user` a `ubuntu` en el YAML.

## Detalles importantes

1. **Región AWS**: está fijada en `us-east-1`. Ajústala si tu EC2 está en otra región.
2. **Ruta de despliegue**: configurable con la variable `EC2_DEPLOY_PATH` al inicio del YAML.
3. **Seguridad en forks**: GitHub no expone secretos en PRs desde forks externos; prueba el pipeline en tu propio fork con los secretos configurados.
4. **`.env` en EC2**: el artefacto no incluye variables de entorno; deben existir previamente en el servidor.

El fichero YAML incluye comentarios en español con toda esta documentación inline. Si quieres, puedo actualizar también la sección de EC2/GitHub Actions del `README.md` para incluir `EC2_SSH_PRIVATE_KEY` y la descripción del pipeline.

---

**User**

Región eu-north-1.

---

**Cursor**

Región AWS actualizada a `eu-north-1` en el paso de configuración de credenciales del job Deploy.

---

**User**

El usuario es ubuntu

---

**Cursor**

Actualizado el workflow para Ubuntu:

- `EC2_SSH_USER`: `ubuntu`
- `EC2_DEPLOY_PATH`: `/home/ubuntu/lti-backend`
- Comentarios del YAML alineados con el usuario Ubuntu

Asegúrate de que ese directorio exista en la instancia y de que el `.env` esté en `/home/ubuntu/lti-backend/.env`.

---

**User**

Quiero que pruebes en local si el pipeline funciona.

---

**Cursor**

Ejecutaré localmente los pasos Test y Build del pipeline; Deploy requiere EC2 y secretos que no tenemos aquí.


PostgreSQL ya está en marcha. Ejecutando los jobs Test y Build del pipeline.


He simulado en local los jobs **Test** y **Build** del pipeline (los mismos pasos que ejecuta GitHub Actions). Resultados:

## Job 1 — Test ✅

| Paso | Resultado |
|------|-----------|
| `npm ci` | 537 paquetes instalados |
| `npx prisma generate` | Cliente Prisma generado |
| `npx prisma migrate deploy` | 4 migraciones, ninguna pendiente |
| `npm test` | **9 suites, 29 tests — todos OK** |

Incluye tests unitarios e integración (PostgreSQL vía Docker en `localhost:5432`).

## Job 2 — Build ✅

| Paso | Resultado |
|------|-----------|
| `npm run build` (`tsc`) | Compilación sin errores |
| Artefacto simulado | `dist/`, `package.json`, `package-lock.json`, `prisma/` presentes |
| `test-results/junit.xml` | Generado correctamente |

## Job 3 — Deploy EC2 ⚠️ No probado en local

El deploy no se puede validar aquí porque requiere los secretos de GitHub (`EC2_INSTANCE`, `EC2_SSH_PRIVATE_KEY`, credenciales AWS) y acceso SSH a tu instancia Ubuntu en `eu-north-1`.

Para probarlo de verdad:
1. Configura los secretos en tu fork de GitHub.
2. Crea un PR (o haz push a la rama del PR).
3. Revisa la ejecución en **Actions → Backend CI/CD Pipeline**.

**Antes del deploy en EC2**, confirma en la instancia:
```bash
mkdir -p /home/ubuntu/lti-backend
# .env con DATABASE_URL en ese directorio
sudo npm install -g pm2
```

¿Quieres que prepare un script local (`scripts/run-pipeline-local.ps1`) para repetir Test + Build con un solo comando?

