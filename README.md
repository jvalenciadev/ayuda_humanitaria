# Plataforma Nacional de Ayuda Humanitaria y Coordinación Interinstitucional

## 🏛️ Descripción General

La **Plataforma Nacional de Ayuda Humanitaria** ("Ayuda Humanitaria") es un sistema institucional digital diseñado para coordinar, articular, verificar y visualizar información crítica durante situaciones de emergencia, desastres naturales, conflictos sociales o crisis humanitarias. 

La plataforma consolida información oficial e inmutable proveniente de instituciones públicas, organizaciones civiles, ONGs y la ciudadanía para fortalecer la capacidad de respuesta, la transparencia gubernamental y la toma de decisiones basada en datos confiables.

---

## ⚡ Arquitectura Tecnológica

El sistema implementa una arquitectura moderna desacoplada en formato de Monorepo:

1. **Frontend (`/apps/web`)**: 
   - Construido con **Next.js 15** (App Router, Turbopack, TypeScript).
   - Estilizado con **TailwindCSS v4**, implementando una paleta institucional premium (Azul Gubernamental, Verde de Asistencia Humanitaria, y Rojo de Alerta Crítica).
   - Sistema de persistencia híbrido: consumo dinámico de API REST con **fallback automático e interactivo a localStorage** y semillas precargadas si la base de datos central está desconectada.
2. **Backend REST API (`/apps/api`)**:
   - Servidor REST robusto basado en **Express (TypeScript)** y **Prisma ORM**.
   - Seguridad mejorada mediante:
     - **Helmet** (Encabezados de protección contra XSS e inyecciones de código).
     - **CORS** habilitado con filtros de origen.
     - **Express Rate Limit** para proteger rutas críticas contra ataques de denegación de servicio.
     - **JWT Authentication** con asignación de Roles para control de accesos.
3. **Base de Datos (`/prisma` y PostgreSQL)**:
   - **PostgreSQL** orquestado localmente en contenedor Docker.
   - **Prisma Schema** con 13 tablas relacionales (Usuarios, Roles, Departamentos, Organizaciones, Comunicados, Ayudas, Hospitales, Reportes Ciudadanos, Víctimas y Logs de Auditoría inmutables).
4. **Orquestación y Despliegue (`/docker` y `docker-compose.yml`)**:
   - Entorno completamente contenedorizado para Base de Datos (`postgres`), Consola de Base de Datos (`pgadmin`), API (`api`) y Portal Web (`web`).

---

## 🔐 Control de Acceso Basado en Roles (RBAC) y Seguridad

El sistema restringe vistas y acciones críticas de acuerdo con cuatro roles predefinidos en la base confidencial:

*   **`SUPER_ADMIN`**: Acceso total de lectura y escritura. Único rol autorizado para auditar la **Bitácora de Trazabilidad del Sistema** (Logs) y exportar actas oficiales cifradas.
*   **`MODERATOR`**: Autorizado para verificar organizaciones registradas, moderar solicitudes de ayuda humanitaria y reclasificar reportes ciudadanos.
*   **`VERIFIER`**: Enfocado en validar la veracidad de reportes multimedia cargados por la ciudadanía y actualizar la disponibilidad clínica de oxígeno.
*   **`VISUALIZER`**: Servidores públicos y veedores con acceso de lectura general para la coordinación táctica en campo.

---

## 📊 Módulos Clave Implementados

1.  **Directorio Nacional de Organizaciones**: Registro público e institucional de ONGs y colectivos de ayuda con flujo de moderación para otorgar el distintivo de **Organización Verificada**.
2.  **Monitor de Ayuda y Requerimientos**: Filtro geográfico y por tipología de solicitudes de auxilio de la población con indicadores de **Urgencia (Baja, Media, Alta, Crítica)** y actualización de bitácoras de seguimiento en tiempo real.
3.  **Monitoreo Clínico de Oxígeno y Camas**: Panel de control para centros hospitalarios críticos que rastrea niveles de oxígeno medicinal y camas libres en terapia intensiva.
4.  **Centro de Información Oficial**: Difusión unificada de comunicados de prensa institucionales y reportes ciudadanos sobre incidentes (con filtros de "Bulbos/Información Falsa" o "Información Verificada").
5.  **Registro Confidencial de Víctimas**: Repositorio de damnificados, desaparecidos y lesionados protegido por la Ley de Protección de Datos Personales, con alertas de seguridad activas.
6.  **Trazabilidad e Inmutabilidad**: Registro centralizado de logs que documenta usuario, acción, tabla modificada, dirección IP y estampa de tiempo para auditorías institucionales estrictas.

---

## 🚀 Guía de Instalación y Ejecución Local

### 1. Requisitos Previos

Asegúrese de tener instalados en su sistema:
*   [Node.js (v18 o superior)](https://nodejs.org/)
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/)

---

### 2. Configuración de la Base de Datos con Docker

Detenga cualquier servicio de PostgreSQL local que pueda entrar en conflicto con el puerto `5432` y levante el contenedor del proyecto:

```bash
# Iniciar servicios de base de datos
npm run db:up
```

*   **PostgreSQL**: Disponible localmente en `localhost:5432`.
*   **pgAdmin 4**: Panel visual accesible en [http://localhost:5050](http://localhost:5050) (Usuario: `admin@humanitaria.gob.bo` | Contraseña: `admin123`).

---

### 3. Migración y Semillero de Datos (Seeding)

Prepare las tablas del sistema y cargue los datos de inicialización oficiales mediante Prisma:

```bash
# Pushing de esquema a la base de datos
npx prisma db push

# Ejecutar el semillero de datos
npm run prisma:seed
```

Esto precargará:
*   Los 9 departamentos oficiales de Bolivia.
*   Las credenciales de los servidores autorizados.
*   Hospitales y ONGs pre-validadas de muestra.
*   Bitácoras iniciales de ayuda humanitaria y trazabilidad.

---

### 4. Servidores de Desarrollo

Inicie concurrentemente los servidores de backend y frontend para la simulación completa:

```bash
# Iniciar API Backend (Puerto 3001)
npm run dev:api

# Iniciar Portal Next.js 15 (Puerto 3000)
npm run dev:web
```

*   **API REST**: Accesible en [http://localhost:3001/api](http://localhost:3001/api). Verificación de salud: [http://localhost:3001/api/health](http://localhost:3001/api/health).
*   **Portal Web**: Navegable en [http://localhost:3000](http://localhost:3000).

---

## 🔑 Cuentas de Acceso Autorizadas (Demo)

Use las siguientes credenciales para probar los flujos de moderación y visualización del panel administrativo en [http://localhost:3000/login](http://localhost:3000/login):

| Rol asignado | Correo Electrónico | Contraseña | Capacidades destacables |
| :--- | :--- | :--- | :--- |
| **SUPER_ADMIN** | `admin@humanitaria.gob.bo` | `admin123` | Control total, Logs de trazabilidad, exportación oficial |
| **MODERATOR** | `moderador@humanitaria.gob.bo` | `admin123` | Validar ONGs, bitácora de seguimiento de ayuda, reportes |
| **VERIFIER** | `verificador@humanitaria.gob.bo` | `admin123` | Clasificar reportes multimedia, actualizar oxígeno medicinal |
| **VISUALIZER** | `visualizador@humanitaria.gob.bo` | `admin123` | Lectura general táctica y reportes consolidados |

---

## 📑 Notas de Implementación

*   **Resiliencia Híbrida**: Si la base de datos central o el backend dockerizado no están activos, el Portal Web conmuta automáticamente a un adaptador local de datos en el cliente. La simulación interactiva se mantiene operativa y reactiva al 100% en el navegador utilizando localStorage.
*   **Firma Digital Cifrada**: Las funciones de exportación en formato Excel y actas PDF en la consola de moderación están firmadas digitalmente y protegidas para garantizar la integridad institucional de los documentos descargados.
