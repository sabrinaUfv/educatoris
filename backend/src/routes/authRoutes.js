const router = require('express').Router();
const ctrl = require('../controllers/ControladorAutenticacao');
const auth = require('../middlewares/authMiddleware');

router.post('/login', ctrl.login);
router.post('/cadastro', ctrl.cadastrar);
router.post('/logout', auth, ctrl.logout);
router.post('/encerrar-sessoes', auth, ctrl.encerrarOutrasSessoes);

module.exports = router;
