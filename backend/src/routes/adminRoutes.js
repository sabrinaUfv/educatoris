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
router.post('/materiais', ctrl.adicionarMaterial);
router.delete('/materiais/:id', ctrl.inativarMaterial);

module.exports = router;
