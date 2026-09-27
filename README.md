# CONNECT2LEARN — Prototipo interactivo (pitch de inversores)

Prototipo de alta fidelidad en Angular 20. Sin backend real: todos los datos
son simulados (mock) y las llamadas de red se emulan con RxJS (`of` +
`delay`, 1000–1500 ms) para que la interfaz muestre spinners y *skeletons*
reales, tal como lo haría en producción.

## Cómo ejecutarlo

Requiere Node.js 20+ (recomendado 22) y npm.

```bash
npm install
npm start
```

Abre `http://localhost:4200`. La app recarga sola al guardar cambios.

Para generar el build de producción (sirve estáticamente cualquier archivo
en `dist/connect2learn/browser`):

```bash
npm run build
```

## Roles y registro multi-rol

El registro permite elegir uno de los **tres roles** del ecosistema. Cada rol
cambia el formulario, el onboarding, la navegación y el copy de las pantallas:

| Rol | Campos propios | Onboarding | Pantalla inicial | Secciones no visibles |
| --- | --- | --- | --- | --- |
| **Estudiante** | Edad (15-25), grado, institución | ≥3 temas de interés | `/app/inicio` | — |
| **Maestro / Tutor** | Edad (18+), materia principal, institución | ≥3 materias que imparte | `/app/inicio` | Tutorías, Supervisión familiar |
| **Padre de familia** | Código de vinculación del hijo | Ninguno (se vincula con el código) | `/app/familia` | Tutorías, Grupos, Reputación |

- El selector de rol reutiliza el patrón `chip` / `aria-pressed` de las
  pantallas existentes; los tres roles se declaran una sola vez en
  `ROLE_OPTIONS` (`src/app/core/models.ts`), que también define el rango de
  edad, el tipo de onboarding y la ruta de inicio de cada uno.
- El rol se persiste en `sessionStorage` junto al resto de la sesión. Las
  sesiones guardadas antes de este cambio se recuperan como `estudiante`.
- El login deduce el rol por el dominio del correo demo (`@docente`, `@familia`).

## Cómo hacer la demo

1. En **Login**, pulsa **"Entrar con la cuenta demo"** (no valida
   credenciales reales; también puedes escribir cualquier correo/contraseña
   con formato válido).
2. Elige al menos 3 intereses y continúa — se guardan con una latencia
   simulada, igual que el resto de las acciones "de red" del prototipo.
3. Desde **Inicio**, entra a **Tutorías**, abre un perfil, elige un horario
   disponible y confirma la reserva. Ese es el **camino feliz completo**:
   login → intereses → inicio → buscar tutor → perfil → reserva confirmada.
   La reserva queda reflejada en el panel de Inicio al volver.
4. El resto de secciones (Comunidad, Recursos, Grupos de estudio, Mensajes,
   Reputación, Supervisión familiar, Perfil) están completamente
   navegables, muestran datos reales y sus acciones funcionan: unirte a un
   grupo, crear uno, invitar a un familiar, responder un mensaje, publicar
   y responder en la comunidad, subir y "descargar" recursos, ver el
   historial de accesos, el seguimiento de logros, la videollamada
   simulada, el registro con Google y la edición del perfil.
   Todas estas funciones son **simuladas** (sin backend), igual que el
   resto del flujo.

### Probar el registro por rol

1. Entra en `/registro` y elige las tres tarjetas de rol: al cambiar de rol
   se actualizan el título, el rango de edad, la etiqueta del campo de
   grado/materia y aparecen los campos propios (materias para el docente,
   código de vinculación para el padre).
2. **Estudiante:** edad 15-25 → `/intereses` → `/app/inicio` con las 9
   secciones en el menú.
3. **Maestro / Tutor:** edad 18+ → `/intereses` con el texto "¿Qué materias
   impartes?" → `/app/inicio` sin "Tutorías" ni "Supervisión familiar".
4. **Padre de familia:** sin rango de edad, con código de vinculación →
   entra directo a `/app/familia` ("Mis hijos"), sin pasar por intereses.

## Funciones simuladas añadidas en esta iteración

Para el pitch se completaron las acciones que antes mostraban
"Próximamente disponible", todas **simuladas** con latencia y estado en
memoria:

- **Comunidad:** hilo de respuestas por publicación (expandir, responder,
  contador en vivo) y filtro "Mis publicaciones" real.
- **Inicio:** búsqueda global (tutores, recursos, grupos, publicaciones),
  centro de notificaciones y marcado como leídas, "Unirme a la sala"
  (videollamada simulada) y descarga de materiales de la sesión.
- **Mensajes:** videollamada simulada por conversación y enlaces directos al
  chat del grupo o del tutor (desde la ficha del grupo, del tutor o del
  panel de inicio).
- **Recursos:** subir un recurso (se añade a la biblioteca) y descarga
  simulada que incrementa el contador.
- **Tutores:** "Cargar más resultados" con paginación y reseñas completas en
  un modal; el chat con el tutor abre Mensajes con ese hilo.
- **Reputación:** modal "Cómo desbloquear este logro" con checklist y barra
  de progreso.
- **Supervisión familiar:** historial de accesos en modal.
- **Reserva:** añadir la sesión al calendario (simulado).
- **Cuenta:** login y registro de Google simulados y recuperación de
  contraseña simulada desde el login.
- **Perfil:** editar información (persiste vía `sessionStorage`), cambiar
  contraseña y privacidad con modales.

## Qué es real y qué es simulado

- **Real:** toda la interfaz, la navegación, el modo oscuro (persistente),
  el formulario de reserva con selección de horario, el composer de
  publicaciones de la comunidad (con "me gusta" en vivo), el chat de
  mensajes (con hilos distintos por conversación y envío optimista), los
  filtros de tutores y recursos, grupos de estudio (crear, unirse, salir,
  ver miembros), supervisión familiar (invitar/revocar familiares vinculados,
  controlar qué se comparte con ellos), y la persistencia de sesión
  (sobrevive a un refresco de página vía `sessionStorage`, se limpia al
  cerrar la pestaña o pulsar "Cerrar sesión").
- **Simulado:** no hay backend, base de datos ni autenticación real. Los
  "servicios" (`src/app/core/*.service.ts`) devuelven arreglos de datos
  fijos definidos en `mock-data.ts`, envueltos en observables con retardo.
  Cerrar la pestaña reinicia el estado. La videollamada muestra un avatar
  estático con contador de tiempo; el calendario, los uploads, las
  descargas, la conexión con Google y la recuperación de contraseña son
  flujos con confirmaciones simuladas.

## Nombres dinámicos según el correo de acceso

El nombre y las iniciales del estudiante se derivan del correo con el que
inicia sesión (`SessionService.nameFromEmail`), no de un dato fijo: por
ejemplo `maria.lopez@correo.com` se muestra como "Maria Lopez". Ese nombre
dinámico es el que aparece en la barra lateral, el saludo de Inicio, Mi
perfil y — en Mensajes — en los mensajes que el propio estudiante envía o
ya tenía en el hilo (antes decían "Alex" fijo sin importar el correo usado).
Los demás participantes de una conversación (tutores, compañeros de grupo)
son personas simuladas con nombre propio y no cambian, igual que en una app
real no cambiarías el nombre de tus contactos.

## Estructura del proyecto

```
src/app/
  core/            Modelos, datos mock y servicios (sesión, catálogo, tema, toasts)
  shared/          Componentes reutilizables (iconos SVG, toggle de tema, toasts)
  pages/           Una carpeta por pantalla (componentes standalone, lazy-loaded)
src/styles.css     Sistema de diseño: tokens de color (claro/oscuro), tipografía,
                   componentes base (botones, cards, chips, formularios, etc.)
```

## Decisiones de diseño

- Paleta cálida ("papel e tinta") heredada de la referencia, con **modo
  oscuro** propio (no es un invertido genérico) — ambos verificados con
  contraste WCAG AA antes de usarse.
- Sin glassmorphism, sin neón/cyberpunk, sin gradientes synthwave, sin
  formas flotantes decorativas, sin tarjetas sobre-redondeadas ni sombras
  difusas, sin HUD futurista. El único gradiente en toda la app es el
  hero cálido durazno→dorado, coherente con la paleta de marca.
- Accesibilidad aplicada de forma consistente: `aria-label`/`aria-pressed`
  en controles interactivos, foco visible (`:focus-visible`) en toda la
  app, objetivos táctiles de 44px mínimo, `prefers-reduced-motion`
  respetado, y un enlace "Saltar al contenido principal".
- Responsive: sidebar fija en escritorio, menú tipo *drawer* con overlay en
  móvil (< 760px); verificado sin scroll horizontal a 390px de ancho.

## Pendiente fuera de este prototipo

Todas las funciones visibles están simuladas y operativas. Queda fuera del
alcance únicamente la integración con backends reales: autenticación OAuth de
Google, pagos, WebRTC/streaming de video, almacenamiento de archivos y
notificaciones push.
