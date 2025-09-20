# Tareas Pendientes y Mejoras Futuras

Este documento lista las posibles próximas mejoras para la aplicación, una vez completada la integración inicial de todas las entidades.

---

### 1. Completar el CRUD: Funcionalidad de Editar y Eliminar

*   **Estado:** 🚧 En Progreso
*   **Descripción:** Añadir la capacidad de actualizar y eliminar registros existentes en todas las páginas de administración.
*   **Tareas:**
    *   [x] Implementar lógica de Edición (Update) en el frontend para la mayoría de las entidades.
    *   [x] Implementar lógica de Borrado (Delete) en el frontend para la mayoría de las entidades.
    *   [x] Añadir endpoints `PUT` y `DELETE` en `server.js` para las entidades correspondientes.
    *   [ ] Revisar y completar la funcionalidad para las entidades restantes (si las hubiera).
    *   [ ] Asegurar que las tablas se refresquen correctamente después de cada operación.

### 2. Mejoras de Experiencia de Usuario (UX)

*   **Estado:** 📝 Pendiente
*   **Descripción:** Implementar funcionalidades para hacer la aplicación más escalable y fácil de usar con grandes volúmenes de datos.
*   **Tareas:**
    *   [ ] Añadir una barra de **búsqueda** en cada página para filtrar resultados en la tabla.
    *   [ ] Implementar **paginación** en las tablas para dividir los resultados en páginas (e.g., 10, 25, 50 registros por página).
    *   [ ] Añadir la opción de **ordenar** las tablas haciendo clic en las cabeceras de las columnas (por nombre, fecha, etc.).

### 3. Sistema de Notificaciones (Feedback al Usuario)

*   **Estado:** 📝 Pendiente
*   **Descripción:** Reemplazar los `alert()` de JavaScript por un sistema de notificaciones moderno (toasts/snackbars) para dar feedback al usuario de forma más elegante.
*   **Tareas:**
    *   [ ] Instalar y configurar una librería de notificaciones como `react-toastify`.
    *   [ ] Reemplazar todas las llamadas a `alert()` y `window.confirm()` por el nuevo sistema.
    *   [ ] Usar notificaciones de éxito (verde), error (rojo) e información (azul) según corresponda.

### 4. Validación de Formularios en el Frontend

*   **Estado:** 📝 Pendiente
*   **Descripción:** Añadir validación en tiempo real a los formularios para guiar al usuario y prevenir errores antes de enviar los datos al servidor.
*   **Tareas:**
    *   [ ] Hacer que los campos obligatorios muestren un error si se dejan vacíos.
    *   [ ] Validar formatos específicos (e.g., que un campo de email contenga un `@`).
    *   [ ] Deshabilitar el botón de "Guardar" si el formulario no es válido.

### 5. Dashboard Interactivo con Gráficas

*   **Estado:** ✅ Completado
*   **Descripción:** Transformar la página de "Dashboard" en un panel útil con visualizaciones de datos y estadísticas clave.
*   **Tareas:**
    *   [x] Crear nuevos endpoints en `server.js` para devolver datos agregados (e.g., `/api/stats/reports-by-client`).
    *   [x] Usar `Chart.js` (integrado en CoreUI) para crear gráficas como:
        *   Gráfico de barras: Número de reportes por cliente.
        *   Gráfico circular: Distribución de entidades por tipo.
        *   Gráfico de líneas: Nuevos usuarios por mes.
    *   [x] Diseñar un layout claro para el dashboard que presente estas gráficas.
