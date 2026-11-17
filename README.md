# EQUATION CHALLENGE

Aplicación educativa PWA para practicar ecuaciones matemáticas.

## Archivos
- `index.html`: estructura de la aplicación.
- `styles.css`: diseño adaptable a móviles y escritorio.
- `app.js`: lógica de retos, puntuación, perfiles y panel docente.
- `manifest.webmanifest`: configuración de instalación PWA.
- `sw.js`: caché básica para funcionamiento sin conexión.
- `icon.svg`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`: iconos.

## Publicar en GitHub Pages
1. Crea un repositorio público en GitHub.
2. Sube todos estos archivos a la raíz del repositorio (no solo el ZIP).
3. Entra a **Settings → Pages**.
4. En **Build and deployment**, selecciona **Deploy from a branch**.
5. Selecciona la rama `main` y la carpeta `/ (root)`, guarda.
6. Espera a que GitHub Pages publique el sitio y abre la URL HTTPS.

## Instalar en el teléfono
- Android: abre la URL en Chrome y usa «Instalar aplicación» o «Añadir a pantalla de inicio».
- iPhone/iPad: abre la URL en Safari → Compartir → «Añadir a pantalla de inicio».

## Importante: alcance de esta versión
Es una demostración funcional local. Los perfiles no tienen autenticación real y los datos se guardan en el almacenamiento del navegador/dispositivo. Por eso, el panel docente solo ve los resultados registrados en ese mismo navegador. Para usarla con un curso real y sincronizar estudiantes de distintos teléfonos, se debe añadir un backend con cuentas, base de datos y permisos (por ejemplo, Firebase o Supabase). No introduzcas datos personales sensibles.
