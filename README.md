# FitControl

Demo de gestión de gimnasio construida con React, Vite, Express y MongoDB.

## Publicar una demo para portfolio

La configuración `render.yaml` publica solo la interfaz como sitio estático de Render. En esta modalidad cada visitante obtiene sus propios datos de demostración y los cambios quedan en el almacenamiento local de su navegador. No se expone la API ni la base de datos a Internet.

1. Subí este proyecto a un repositorio de GitHub.
2. En Render, elegí **New → Blueprint**, conectá ese repositorio y confirmá la configuración de `render.yaml`.
3. Esperá a que termine el despliegue. Render te dará una URL pública `https://fitcontrol-....onrender.com` para compartir.

No compartas datos de acceso ni publiques la API sin agregar autenticación y autorización.

## Ejecutar frontend y API con MongoDB local

- Node.js 20 o superior.
- MongoDB local mediante Docker, una instalación propia o una URI de MongoDB Atlas.

## Ejecutar en desarrollo

1. Instalá las dependencias:

   ```bash
   npm install
   ```

2. Iniciá MongoDB local con Docker:

   ```bash
   docker compose up -d mongodb
   ```

   Para usar MongoDB Atlas u otro servidor, copiá `.env.example` a `.env` y configurá `MONGODB_URI` con la URI correspondiente.

3. Abrí una terminal e iniciá la API:

   ```bash
   npm run server
   ```

4. En otra terminal, iniciá la interfaz:

   ```bash
   npm run dev
   ```

   Abrí la URL que muestra Vite, normalmente `http://localhost:5173`.

Al ejecutar localmente, Vite intenta conectarse a la API. La primera vez, FitControl envía los datos de ejemplo a MongoDB. Si ya existe información en la base, esa información se carga en la aplicación. La API está disponible en `http://127.0.0.1:4000/api` y su endpoint de estado es `/api/health`.

## Modo local

La interfaz sigue funcionando si Express o MongoDB no están disponibles. En ese caso, conserva los cambios en `localStorage`, los marca como pendientes y los sincroniza cuando vuelve a haber conexión. También se pueden exportar e importar respaldos JSON desde Configuración.

## Producción

Esta es una demo de un solo gimnasio: el estado se persiste como un documento en MongoDB. La API no incorpora autenticación ni autorización, por lo que antes de publicarla para usuarios reales hay que agregar inicio de sesión, permisos y aislamiento de datos por gimnasio.
