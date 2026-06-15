const router = require('express').Router();
const ctrl = require('../controllers/ControladorUsuarios');
const auth = require('../middlewares/authMiddleware');
const admin = require('../middlewares/adminMiddleware');

router.use(auth, admin);

router.get('/professores', ctrl.listarProfessores);
router.patch('/professores/:id/status', ctrl.alterarStatus);
router.put('/planos/:id', ctrl.atualizarPlano);
router.get('/conteudos', ctrl.listarConteudos);
router.post('/conteudos', ctrl.adicionarConteudo);
router.delete('/conteudos/:id', ctrl.inativarConteudo);

// Novas rotas de gerenciamento avançado de conteúdo
router.delete('/conteudos/:id/deletar', ctrl.deletarConteudo);
router.patch('/conteudos/:id/status', ctrl.alternarStatusConteudo);

router.post('/materiais', ctrl.adicionarMaterial);
router.put('/materiais/:id', ctrl.editarMaterial);
router.delete('/materiais/:id', ctrl.inativarMaterial);

module.exports = router;