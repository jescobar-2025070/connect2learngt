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
| **Padre de familia** | Código de vinculación del hijo | Ninguno (se vincula con el código) | `/app/familia` | Inicio, Grupos, Mensajes, Reputación, Intereses |

### Matriz de permisos por rol

El padre no es "un estudiante con menos cosas": es un rol de acompañamiento.
No tiene panel propio ni datos escolares, y todo lo que hace en la aplicación
es **en nombre de su hijo**. La tabla vive en un solo sitio,
`src/app/core/permissions.ts`, y la consumen tanto el menú como los guards de
ruta, de modo que ocultar una sección y bloquearla por URL no pueden divergir.

| Sección | Estudiante | Tutor | Padre |
| --- | :---: | :---: | :---: |
| Inicio | ✅ | ✅ | — |
| Tutorías (reservar) | ✅ | — | ✅ (a nombre del hijo) |
| Comunidad | ✅ | ✅ | ✅ solo lectura |
| Recursos | ✅ | ✅ | ✅ solo descarga |
| Grupos de estudio | ✅ | ✅ | — |
| Mensajes | ✅ | ✅ | — |
| Reputación | ✅ | ✅ | — |
| Supervisión familiar | ✅ (comparte) | — | ✅ (supervisa) |
| Perfil | ✅ | ✅ | ✅ (sin datos escolares) |

| Acción | Estudiante | Tutor | Padre |
| --- | :---: | :---: | :---: |
| Publicar en comunidad | ✅ | ✅ | — |
| Subir recursos | ✅ | ✅ | — |
| Chatear | ✅ | ✅ | — |
| Unirse a grupos | ✅ | ✅ | — |
| Reservar para sí mismo | ✅ | — | — |
| Reservar para un hijo | — | — | ✅ |
| Ver los datos de un hijo | — | — | ✅ |
| Cambiar qué se comparte | ✅ | — | — |

- Una sección no visible tampoco se alcanza escribiendo la URL: `sectionGuard`
  (`src/app/core/auth.guard.ts`) lee `data.section` de la ruta, consulta
  `canAccessSection()` y, si el rol no tiene acceso, avisa y devuelve a
  `startRoute()`.
- Los permisos se comprueban **también en el método**, no solo ocultando el
  botón: `publish()`, `toggleLike()`, `sendReply()`, `openUpload()` y
  `submitUpload()` rechazan la acción si el rol no la tiene.
- La reserva del padre guarda a quién se le agenda (`forName`, `forChildId`) y
  quién la agendó (`bookedByRole`), así que la misma sesión se distingue de la
  que creó su hijo.

- El selector de rol reutiliza el patrón `chip` / `aria-pressed` de las
  pantallas existentes; los tres roles se declaran una sola vez en
  `ROLE_OPTIONS` (`src/app/core/models.ts`), que también define el rango de
  edad, el tipo de onboarding y la ruta de inicio de cada uno.
- El rol se persiste en `sessionStorage` junto al resto de la sesión. Las
  sesiones guardadas antes de este cambio se recuperan como `estudiante`.
- El login deduce el rol por el dominio del correo demo (`@docente`, `@familia`).

### El código de vinculación

El vínculo entre padre e hijo se hace con un código, no con un correo: el hijo
lo genera su cuenta (`C2L-XXXX-XXX`, en **Perfil → Código de vinculación**) y el
padre lo escribe al registrarse o en su panel. Un código que no existe no
vincula a nadie, y "desvincular" es una acción real que borra el vínculo de la
sesión.

Como el prototipo guarda una sola sesión por navegador, el hijo de la demo y su
padre no pueden estar conectados a la vez: la reserva que el padre agende se
verá en su panel, pero no en una segunda ventana abierta como estudiante.

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

### Probar el rol padre

1. Entra en `/registro`, elige **Padre de familia** y escribe el código
   `C2L-4F7K-2Q` (es el del estudiante de la demo) → `/app/familia`.
2. En el panel del hijo verás su progreso semanal, el avance por materia, sus
   sesiones —marcando cuáles agendó él y cuáles agendaste tú— y sus tutores.
   Desde aquí puedes **reservarle** una tutoría nueva.
3. Entra en **Comunidad**: se abre en modo lectura, sin compositor, sin
   "me gusta" y sin poder responder. En **Recursos** se puede descargar pero
   no subir. Si escribes `/app/mensajes` o `/app/inicio` a mano, el guard te
   devuelve al panel con un aviso.

### Probar el registro por rol

1. Entra en `/registro` y elige las tres tarjetas de rol: al cambiar de rol
   se actualizan el título, el rango de edad, la etiqueta del campo de
   grado/materia y aparecen los campos propios (materias para el docente,
   código de vinculación para el padre).
2. **Estudiante:** edad 15-25 → `/intereses` → `/app/inicio` con las 9
   secciones en el menú. En **Perfil** aparece el código de vinculación para
   compartirlo con la familia.
3. **Maestro / Tutor:** edad 18+ → `/intereses` con el texto "¿Qué materias
   impartes?" → `/app/inicio` sin "Tutorías" ni "Supervisión familiar".
4. **Padre de familia:** sin rango de edad, con código de vinculación →
   entra directo a `/app/familia` (panel del hijo), sin pasar por intereses.
   Con el código de la demo (`C2L-4F7K-2Q`, el mismo que aparece en el perfil
   del estudiante demo) ve el progreso, las sesiones y los tutores del hijo; con
   cualquier otro código ve el estado "sin hijo vinculado" y puede intentarlo
   otra vez.

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

## Manejo de errores

Los errores no se muestran nunca con su texto técnico (`TypeError`, SQL,
`500`, un `stack trace`). Hay un único camino para traducirlos:

- **`src/app/core/error-messages.ts`** — tabla de 10 tipos de error
  (`validation`, `auth`, `forbidden`, `notFound`, `conflict`, `offline`,
  `timeout`, `rateLimit`, `server`, `unknown`) con su título, su explicación
  en lenguaje natural y si tiene sentido reintentar. También decide el tipo a
  partir de un código HTTP o de los mensajes que emite el navegador cuando no
  hay servidor (`Failed to fetch`, `NetworkError`, `Load failed`, `status: 0`).
- **`src/app/core/error.service.ts`** — `report()` guarda la traza en la consola
  y muestra el aviso; el operador `errors.catch('contexto')` hace ambos cosas de
  una vez dentro de un `pipe` y corta la suscripción con `EMPTY` para que la
  vista no se quede a medias.
- **`src/app/core/error.handler.ts`** — `ErrorHandler` global (registrado en
  `app.config.ts` junto a `withNavigationErrorHandler`) para lo que escapa de
  cualquier `subscribe`: errores de navegación, promesas sin `catch` y
  excepciones fuera de los callbacks de Angular.

Todas las llamadas de `subscribe` siguen el mismo orden, de modo que el
indicador de carga se limpia siempre, haya éxito o fallo:

```ts
this.catalog
  .getStudyGroups(subject)
  .pipe(
    finalize(() => this.loading.set(false)),
    this.errors.catch('grupos.lista', () => this.search()),
  )
  .subscribe((list) => this.groups.set(list));
```

Cuando el reintento automático no basta, la pantalla muestra un estado de
error propio con botón "Reintentar" (ficha del tutor, grupo de estudio, reseñas)
en lugar de un estado vacío que mentiría al usuario. El aviso incluye la acción
"Reintentar" solo en los errores reintentables: un `401` o un `403` no
proponen repetir algo que va a volver a fallar.

**Pendiente cuando exista backend:** los estados HTTP ya están mapeados y
listos, pero no se pueden provocar desde la app. El prototipo no usa
`HttpClient` (los servicios devuelven datos en memoria), así que `400`, `401`,
`403`, `409`, `422`, `429` y `5xx` solo se han verificado con la tabla de
mapeo, no contra respuestas reales.

## Página no encontrada

Las rutas inexistentes ya no se redirigen al login. Hay dos 404 distintos, ambos
con el mismo componente (`src/app/pages/not-found/`):

- Dentro de `/app/**` se muestra **dentro del shell**, para que el usuario
  conserve la navegación lateral y pueda seguir con otra sección.
- Fuera de `/app` se muestra **a pantalla completa** con marca e interruptor de
  tema, igual que las pantallas de acceso.

El componente es responsivo (reorganiza la composición en móvil), respeta el
modo oscuro y los targets táctiles de 44px, y ofrece dos salidas: "Volver al
inicio" (al panel del rol) y "Regresar" (historial del navegador).

## Estructura del proyecto

```
src/app/
  core/            Modelos, datos mock y servicios (sesión, catálogo, tema, toasts,
                   errores)
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
