const MaterialFactory = require('../MaterialFactory');
const { Arquivo, VideoAula, Laboratorio } = require('../../../models/Material');

describe('MaterialFactory', () => {
  test('cria Arquivo', () => {
    const m = MaterialFactory.criar('arquivo', { id: 1, titulo: 'A', editavel: 1 });
    expect(m).toBeInstanceOf(Arquivo);
    expect(m.tipo).toBe('arquivo');
    expect(m.editavel).toBe(true);
  });

  test('cria VideoAula', () => {
    const m = MaterialFactory.criar('videoaula', { id: 2, titulo: 'V', narrado: 1 });
    expect(m).toBeInstanceOf(VideoAula);
    expect(m.narrado).toBe(true);
  });

  test('cria Laboratorio', () => {
    const m = MaterialFactory.criar('laboratorio', { id: 3, titulo: 'L', remoto: 1 });
    expect(m).toBeInstanceOf(Laboratorio);
    expect(m.remoto).toBe(true);
  });

  test('lança erro para tipo desconhecido', () => {
    expect(() => MaterialFactory.criar('inexistente', {})).toThrow(/desconhecido/);
  });
});
