import { CHILDREN, synthChildForCode, synthChildId, synthSessionsForChild } from './mock-data';
import { LINKED_CODE_PATTERN, generateLinkedCode, normalizeLinkedCode } from './session.service';

/**
 * Lo que garantiza la vinculación de un hijo en el prototipo:
 *  - el padre llega con un hijo vinculado, para no enseñar un panel vacío,
 *  - cualquier código con el formato correcto vincula a alguien: en una demo no
 *    puede depender de que el espectador se acuerde del código de ejemplo,
 *  - el mismo código devuelve siempre el mismo hijo, y distintos códigos dan
 *    hijos distintos: si no, recargar cambiaría el perfil que se acaba de
 *    vincular,
 *  - lo único que se rechaza es un código mal escrito.
 */
describe('vinculación de un hijo', () => {
  describe('códigos', () => {
    it('acepta el formato C2L-XXXX-XXX y rechaza lo que se le parece', () => {
      const validos = ['C2L-4F7K-2Q7', 'C2L-0000-000', 'C2L-ZZ99-9ZT'];
      const invalidos = [
        'C2L-4F7K', // un bloque de menos
        'C2L-4F7KK-2Q', // bloque largo
        'c2l-4f7k-2q7', // minúsculas: se normalizan antes de comprobar
        'C2L-4F7K-2', // tres caracteres de menos
        'X2L-4F7K-2Q', // prefijo equivocado
        'hola',
        '',
      ];

      for (const code of validos) {
        expect(LINKED_CODE_PATTERN.test(code))
          .withContext(`${code} debería ser válido`)
          .toBe(true);
      }
      for (const code of invalidos) {
        expect(LINKED_CODE_PATTERN.test(code))
          .withContext(`${code} no debería ser válido`)
          .toBe(false);
      }
    });

    it('normaliza lo que escribe el padre antes de comprobarlo', () => {
      expect(normalizeLinkedCode('  c2l-4f7k-2q7 ')).toBe('C2L-4F7K-2Q7');
      expect(LINKED_CODE_PATTERN.test(normalizeLinkedCode(' c2l-4f7k-2q7 '))).toBe(true);
    });

    it('emite códigos válidos y distintos entre sí', () => {
      const generados = Array.from({ length: 50 }, () => generateLinkedCode());

      for (const code of generados) {
        expect(LINKED_CODE_PATTERN.test(code))
          .withContext(`${code} no cumple el formato que se valida en la pantalla`)
          .toBe(true);
      }
      // Que dos códigos coincidieran es improbable, pero si el generador se
      // cambiara por una constante la demo dejaría de poder mostrar dos hijos.
      expect(new Set(generados).size).toBe(generados.length);
    });
  });

  describe('synthChildForCode', () => {
    it('devuelve el mismo hijo para el mismo código', () => {
      const a = synthChildForCode('C2L-9K3M-7XT');
      const b = synthChildForCode('C2L-9K3M-7XT');

      expect(b).toEqual(a);
    });

    it('da hijos distintos para códigos distintos', () => {
      const a = synthChildForCode('C2L-9K3M-7XT');
      const b = synthChildForCode('C2L-4F7K-2Q7');
      const c = synthChildForCode('C2L-ZZ99-9ZT');

      expect(new Set([a.id, b.id, c.id]).size).toBe(3);
    });

    it('rellena un perfil completo y creíble', () => {
      const child = synthChildForCode('C2L-3Q8M-4RT');

      expect(child.id).toBe(synthChildId('C2L-3Q8M-4RT'));
      expect(child.name.length).toBeGreaterThan(3);
      expect(child.initials).toMatch(/^[A-Z]{2}$/);
      expect(child.age).toBeGreaterThanOrEqual(14);
      expect(child.age).toBeLessThanOrEqual(17);
      expect(child.grade).toBeTruthy();
      expect(child.institution).toBeTruthy();
      expect(child.linkedCode).toBe('C2L-3Q8M-4RT');
      // El panel pinta barras con estos valores: un porcentaje fuera de rango
      // se vería como una barra rota.
      expect(child.weeklyGoalPercent).toBeGreaterThan(0);
      expect(child.weeklyGoalPercent).toBeLessThanOrEqual(100);
      expect(child.subjectProgress.length).toBeGreaterThan(0);
      for (const sp of child.subjectProgress) {
        expect(sp.percent).toBeGreaterThanOrEqual(0);
        expect(sp.percent).toBeLessThanOrEqual(100);
      }
      // Sin tutores, la tarjeta de tutores quedaría vacía en la demo.
      expect(child.tutorIds.length).toBeGreaterThan(0);
    });

    it('no pisa el hijo de los datos de ejemplo', () => {
      // El código de la demo tiene una ficha escrita a mano con más detalle; el
      // catálogo la devuelve tal cual en lugar de generar una.
      const demo = CHILDREN.find((c) => c.linkedCode === 'C2L-4F7K-2Q7');

      expect(demo).toBeDefined();
      expect(synthChildForCode('C2L-4F7K-2Q7').id).not.toBe(demo!.id);
    });
  });

  describe('synthSessionsForChild', () => {
    it('genera una sesión del hijo y otra del padre, para poder distinguirlas', () => {
      const child = synthChildForCode('C2L-5B7N-2KD');
      const sessions = synthSessionsForChild(child);

      expect(sessions.length).toBe(2);
      expect(sessions.filter((b) => b.bookedByRole === 'padre').length).toBe(1);
      expect(sessions.filter((b) => b.bookedByRole === 'estudiante').length).toBe(1);
      for (const s of sessions) {
        expect(s.forChildId).toBe(child.id);
        expect(s.forName).toBe(child.name);
        expect(s.tutorName).toBeTruthy();
        expect(s.date).toBeTruthy();
        expect(s.time).toBeTruthy();
      }
    });
  });
});
