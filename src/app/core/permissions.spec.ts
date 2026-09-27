import { canAccessSection, capabilitiesOf, SECTION_ROLES, SectionKey } from './permissions';
import { ROLE_OPTIONS } from './models';

/**
 * Lo que garantiza la matriz de permisos:
 *  - el padre no tiene panel propio, ni mensajería, ni grupos, ni reputación,
 *  - el padre sí llega a tutores, comunidad y recursos, pero sin poder escribir,
 *  - el estudiante y el tutor no pierden nada de lo que ya tenían,
 *  - la matriz no depende de la sección: cada sección se decide por su propia
 *    lista de roles, así que añadir una sección obliga a declararla.
 *
 * Ojo con `intereses`: no es una sección de usuario final, es el paso de
 * onboarding que precede al shell y al que `onboardingGuard` manda a cualquiera
 * sin intereses guardados. Solo el padre se lo salta, porque se vincula a su
 * hijo con un código en vez de elegir materias. Por eso el tutor entra y la
 * familia no: negar `intereses` al tutor no sería restrictivo, lo dejaría en un
 * bucle de redirección entre `/app` y `/intereses`.
 */
describe('permisos por rol', () => {
  describe('canAccessSection', () => {
    it('deja al padre fuera de Inicio, Mensajes, Grupos y Reputación', () => {
      const fuera: SectionKey[] = ['inicio', 'mensajes', 'grupos', 'reputacion', 'intereses'];

      for (const section of fuera) {
        expect(canAccessSection('padre', section))
          .withContext(`el padre no debería entrar en ${section}`)
          .toBe(false);
      }
    });

    it('deja al padre dentro de Tutores, Comunidad, Recursos, Familia y Perfil', () => {
      const dentro: SectionKey[] = ['tutores', 'comunidad', 'recursos', 'familia', 'perfil'];

      for (const section of dentro) {
        expect(canAccessSection('padre', section))
          .withContext(`el padre sí debería entrar en ${section}`)
          .toBe(true);
      }
    });

    it('mantiene al estudiante con su panel completo', () => {
      const secciones: SectionKey[] = [
        'inicio',
        'tutores',
        'comunidad',
        'recursos',
        'grupos',
        'mensajes',
        'reputacion',
        'familia',
        'perfil',
      ];

      for (const section of secciones) {
        expect(canAccessSection('estudiante', section))
          .withContext(`el estudiante perdió ${section}`)
          .toBe(true);
      }
    });

    it('le deja al tutor su panel y le cierra la familiar', () => {
      expect(canAccessSection('tutor', 'inicio')).toBe(true);
      expect(canAccessSection('tutor', 'tutores')).toBe(true);
      expect(canAccessSection('tutor', 'comunidad')).toBe(true);
      expect(canAccessSection('tutor', 'recursos')).toBe(true);
      // `familia` es la única sección de usuario final que el tutor no ve: la
      // gestión del hijo es del padre.
      expect(canAccessSection('tutor', 'familia')).toBe(false);
      // Y el onboarding sí lo ve. `intereses` no es una sección de usuario
      // final, es el paso previo al shell al que `onboardingGuard` manda a
      // cualquier cuenta sin intereses guardados, así que un tutor al que se le
      // negara rebotaría entre `/app` y `/intereses` para siempre.
      expect(canAccessSection('tutor', 'intereses')).toBe(true);
    });

    it('deniega una sección que no exista en la matriz', () => {
      // El guard lee `data.section` de la ruta, que es texto libre. Una clave
      // desconocida se deniega en vez de concederse: si alguien escribe mal el
      // `data.section` de una ruta, lo que falla es el acceso, no la seguridad.
      expect(canAccessSection('estudiante', 'inventada')).toBe(false);
      expect(canAccessSection('padre', 'app/inicio')).toBe(false);
    });

    it('no deja ninguna sección sin roles declarados', () => {
      for (const [section, roles] of Object.entries(SECTION_ROLES)) {
        expect(roles.length)
          .withContext(`${section} no declara ningún rol: nadie podría entrar`)
          .toBeGreaterThan(0);
      }
    });

    it('deja entrar a /intereses a todo rol cuyo onboarding no es vinculación', () => {
      // Este es el invariante que sostiene la matriz, y el que hace que
      // `models.ts`, `permissions.ts` y `auth.guard.ts` no puedan separarse:
      // `onboardingGuard` manda a /intereses a cualquier cuenta sin intereses
      // guardados, así que ese paso tiene que ser alcanzable para todo rol que
      // no opte por vincularse a un hijo. Si la matriz y el onboarding se
      // contradicen, el guard y el guard de sección se pisan y la cuenta entra
      // en bucle; aquí se ve antes de que llegue al navegador.
      for (const { id, onboarding, label } of ROLE_OPTIONS) {
        const esperado = onboarding !== 'vinculacion';
        expect(canAccessSection(id, 'intereses'))
          .withContext(`${label} (onboarding: ${onboarding})`)
          .toBe(esperado);
      }
    });
  });

  describe('capabilitiesOf', () => {
    it('permite al padre agendar tutorías solo a su hijo', () => {
      const caps = capabilitiesOf('padre');

      expect(caps.bookForChild).toBe(true);
      expect(caps.viewChild).toBe(true);
      // La diferencia con el estudiante no está en que pueda agendar, sino en
      // para quién: nunca para sí mismo.
      expect(caps.bookForSelf).toBe(false);
    });

    it('quita al padre toda acción de escritura', () => {
      const caps = capabilitiesOf('padre');

      expect(caps.publish).toBe(false);
      expect(caps.upload).toBe(false);
      expect(caps.chat).toBe(false);
      expect(caps.joinGroups).toBe(false);
      expect(caps.manageSharing).toBe(false);
    });

    it('deja al estudiante y al tutor con permisos plenos', () => {
      for (const role of ['estudiante', 'tutor'] as const) {
        const caps = capabilitiesOf(role);
        expect(caps.publish).toBe(true);
        expect(caps.upload).toBe(true);
        expect(caps.chat).toBe(true);
        expect(caps.joinGroups).toBe(true);
        expect(caps.bookForSelf).toBe(true);
        expect(caps.manageSharing).toBe(true);
      }
    });
  });
});
