require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const db = require('../config/database');
const bcrypt = require('bcryptjs');

function seed() {
  // Não usa INSERT OR IGNORE: a tabela planos não tem UNIQUE no título, então
  // rodar o seed novamente duplicaria os planos. Inserimos só o que ainda não existe.
  const planoExiste = db.prepare('SELECT id FROM planos WHERE LOWER(titulo) = LOWER(?)');
  const inserirPlano = (titulo, descricao, preco, nivel, video, labRem, labVirt, contEdit) => {
    if (planoExiste.get(titulo)) return;
    db.prepare(
      `INSERT INTO planos (titulo, descricao, preco, nivel, acesso_video, acesso_lab_rem, acesso_lab_virt, acesso_cont_edit, acesso_cont_download)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`
    ).run(titulo, descricao, preco, nivel, video, labRem, labVirt, contEdit);
  };

  inserirPlano('Básico',        'Aulas prontas e exercícios.',                  29.90, 1, 1, 0, 0, 0);
  inserirPlano('Intermediário', 'Básico + Laboratórios Virtuais.',              49.90, 2, 1, 0, 1, 1);
  inserirPlano('Avançado',      'Intermediário + Laboratórios Remotos.',        79.90, 3, 1, 1, 1, 1);

  // Admin padrão
  if (!db.prepare("SELECT id FROM usuarios WHERE email = 'admin@educatoris.com'").get()) {
    const r = db.prepare(
      "INSERT INTO usuarios (nome, email, senha, tipo) VALUES ('Administrador', 'admin@educatoris.com', ?, 'administrador')"
    ).run(bcrypt.hashSync('admin123', 10));
    db.prepare('INSERT INTO administradores (id) VALUES (?)').run(r.lastInsertRowid);
  }

  // Professor demo
  if (!db.prepare("SELECT id FROM usuarios WHERE email = 'prof@educatoris.com'").get()) {
    const r = db.prepare(
      "INSERT INTO usuarios (nome, email, senha, tipo) VALUES ('Professor Demo', 'prof@educatoris.com', ?, 'professor')"
    ).run(bcrypt.hashSync('prof123', 10));
    db.prepare('INSERT INTO professores (id, lim_disp_ativos) VALUES (?, 3)').run(r.lastInsertRowid);

    const plano1 = db.prepare("SELECT id FROM planos WHERE nivel = 1").get();
    const dataVenc = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const assinId = db.prepare(
      'INSERT INTO assinaturas (id_plano, id_usuario, data_vencimento) VALUES (?, ?, ?)'
    ).run(plano1.id, r.lastInsertRowid, dataVenc).lastInsertRowid;
    db.prepare('UPDATE professores SET assinatura_id = ? WHERE id = ?').run(assinId, r.lastInsertRowid);
  }

  // Conteúdos de exemplo
  if (!db.prepare('SELECT id FROM conteudos LIMIT 1').get()) {
    // 1º Ano
    const c1 = db.prepare(
      "INSERT INTO conteudos (titulo, ano_escolar, tema) VALUES ('Cinemática', 1, 'Mecânica')"
    ).run().lastInsertRowid;

    const m1 = db.prepare(
      "INSERT INTO materiais (conteudo_id, titulo, descricao, url, tipo) VALUES (?, 'Aula Pronta: Movimento Uniforme', 'Apresentação completa com exercícios', '/uploads/mu.pdf', 'arquivo')"
    ).run(c1).lastInsertRowid;
    db.prepare('INSERT INTO arquivos (id, editavel, avanco) VALUES (?, 0, 0)').run(m1);

    const m2 = db.prepare(
      "INSERT INTO materiais (conteudo_id, titulo, descricao, url, tipo) VALUES (?, 'Videoaula: Introdução à Cinemática', 'Como dar a aula de cinemática', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'videoaula')"
    ).run(c1).lastInsertRowid;
    db.prepare('INSERT INTO videoaulas (id, narrado, demonstrativo) VALUES (?, 1, 0)').run(m2);

    const m3 = db.prepare(
      "INSERT INTO materiais (conteudo_id, titulo, descricao, url, tipo) VALUES (?, 'Lab Virtual: Movimento de Projéteis', 'Simulação PhET - queda livre e lançamento', 'https://phet.colorado.edu/sims/html/projectile-motion/latest/projectile-motion_all.html?locale=pt_BR', 'laboratorio')"
    ).run(c1).lastInsertRowid;
    db.prepare('INSERT INTO laboratorios (id, remoto) VALUES (?, 0)').run(m3);

    // 2º Ano
    const c2 = db.prepare(
      "INSERT INTO conteudos (titulo, ano_escolar, tema) VALUES ('Termodinâmica', 2, 'Calor e Temperatura')"
    ).run().lastInsertRowid;

    const m4 = db.prepare(
      "INSERT INTO materiais (conteudo_id, titulo, descricao, url, tipo) VALUES (?, 'Aula Pronta: Leis da Termodinâmica', 'Slides com exemplos e problemas resolvidos', '/uploads/termo.pdf', 'arquivo')"
    ).run(c2).lastInsertRowid;
    db.prepare('INSERT INTO arquivos (id, editavel, avanco) VALUES (?, 0, 0)').run(m4);

    const m5 = db.prepare(
      "INSERT INTO materiais (conteudo_id, titulo, descricao, url, tipo) VALUES (?, 'Lab Remoto: Calorimetria', 'Experimento de calorimetria em laboratório real', 'https://labsland.com/pt/labs/', 'laboratorio')"
    ).run(c2).lastInsertRowid;
    db.prepare('INSERT INTO laboratorios (id, remoto) VALUES (?, 1)').run(m5);

    // 3º Ano
    const c3 = db.prepare(
      "INSERT INTO conteudos (titulo, ano_escolar, tema) VALUES ('Óptica Geométrica', 3, 'Óptica')"
    ).run().lastInsertRowid;

    const m6 = db.prepare(
      "INSERT INTO materiais (conteudo_id, titulo, descricao, url, tipo) VALUES (?, 'Videoaula: Reflexão e Refração', 'Demonstração com espelhos e lentes', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'videoaula')"
    ).run(c3).lastInsertRowid;
    db.prepare('INSERT INTO videoaulas (id, narrado, demonstrativo) VALUES (?, 1, 1)').run(m6);
  }

  console.log('Seed executado. Credenciais de acesso:');
  console.log('  Admin:    admin@educatoris.com / admin123');
  console.log('  Professor: prof@educatoris.com  / prof123');
}

seed();
