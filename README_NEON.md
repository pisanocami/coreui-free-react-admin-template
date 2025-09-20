# Guía de Integración: Neon DB + Drizzle ORM

Este documento explica la arquitectura de la aplicación y proporciona una guía paso a paso para que los desarrolladores puedan integrar nuevas entidades de la base de datos Neon en la aplicación.

## Arquitectura General

- **Frontend**: Aplicación de React construida con Vite. El código fuente se encuentra en `src/`.
- **Backend**: Servidor de Node.js con Express, ubicado en `server.js`. Este servidor actúa como una API que se comunica con la base de datos.
- **Base de Datos**: PostgreSQL serverless de Neon.
- **ORM**: Drizzle ORM. El esquema de la base de datos, generado por introspección, se encuentra en `drizzle/schema.js`.

---

## Configuración del Entorno de Desarrollo Local

1.  **Clonar el Repositorio**.

2.  **Instalar Dependencias**:
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno**:
    - Crea un archivo llamado `.env` en la raíz del proyecto.
    - Añade tu cadena de conexión de Neon a este archivo. El archivo `.gitignore` ya está configurado para ignorar este archivo, por lo que tus credenciales no se subirán a Git.

    ```.env
    # Pega aquí tu cadena de conexión de Neon
    NEON_DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
    ```

---

## Cómo Añadir una Nueva Entidad (Ej: "Reports")

Sigue estos pasos para crear los endpoints de API y la página de frontend para una nueva tabla de tu base de datos.

### 1. (Opcional) Re-inspeccionar la Base de Datos

Si la estructura de tu base de datos en Neon ha cambiado, ejecuta este comando para actualizar tu esquema local en `drizzle/schema.js`:

```bash
npm run db:introspect
```

### 2. Añadir el Endpoint en el Backend

Abre `server.js` y sigue el patrón del endpoint `/api/clients`.

```javascript
// server.js

// 1. Importa el nuevo modelo desde el esquema
import { db } from './src/db/index.js';
import { client, report } from './drizzle/schema.js'; // Añade 'report'

// ... (código existente)

// 2. Crea el nuevo endpoint GET para 'reports'
app.get('/api/reports', async (req, res) => {
  try {
    const reports = await db.select().from(report).limit(10);
    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// 3. (Opcional) Crea los endpoints POST, PUT, DELETE siguiendo el ejemplo de POST /api/clients

// ... (resto del código)
```

### 3. Crear la Página en el Frontend

1.  **Crea el Componente**: Crea un nuevo archivo, por ejemplo, `src/pages/Reports/Reports.jsx`. Puedes copiar y pegar el contenido de `src/pages/Clients/Clients.jsx` y adaptarlo para que llame a `/api/reports` y muestre las columnas correctas.

2.  **Añade la Ruta**: Abre `src/routes.js`.
    - Importa tu nuevo componente: `const Reports = React.lazy(() => import('./pages/Reports/Reports'))`
    - Añade el objeto de ruta al array: `{ path: '/reports', name: 'Reports', element: Reports }`

3.  **Añade al Menú**: Abre `src/_nav.js`.
    - Importa un ícono si es necesario.
    - Añade un nuevo objeto al array `_nav` para enlazar a tu nueva página `/reports`.

### 4. Ejecutar y Probar

Para probar tus cambios localmente, necesitas dos terminales:

- **Terminal 1 (Backend)**:
  ```bash
  node server.js
  ```

- **Terminal 2 (Frontend)**:
  ```bash
  npm start
  ```

El proxy de Vite en `vite.config.mjs` se encargará de redirigir las llamadas a `/api` a tu servidor backend.

---

## Despliegue en Replit

El proyecto está configurado para desplegarse automáticamente en Replit.

1.  **Configura los Secrets**: En tu Replit, ve a la pestaña "Secrets" (🔒) y asegúrate de que la variable `NEON_DATABASE_URL` esté configurada con tu cadena de conexión de producción.
2.  **Ejecuta el Despliegue**: Simplemente presiona el botón "▶️ Run". Replit seguirá las instrucciones del archivo `.replit`:
    - Instalará las dependencias (`npm install`).
    - Construirá la aplicación de React (`npm run build`).
    - Lanzará el servidor unificado `server.js` (`npm start`).
