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
   navegables, muestran datos reales y sus acciones principales funcionan
   de verdad (unirte a un grupo, crear uno, invitar a un familiar,
   responder un mensaje...). Solo algunos botones puntuales de segundo
   nivel (subir un archivo, videollamada, editar el perfil, chat propio de
   un grupo) muestran un aviso "Próximamente disponible", por quedar fuera
   del alcance de esta ronda de pitch.

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
  Cerrar la pestaña reinicia el estado.

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

Dentro de Grupos de estudio y Supervisión familiar, algunas acciones de
segundo nivel (chat propio del grupo, videollamada, historial de accesos)
siguen mostrando "Próximamente disponible": la pantalla principal de cada
sección es completamente funcional, pero esas acciones puntuales quedan
fuera del alcance de esta ronda de pitch.
