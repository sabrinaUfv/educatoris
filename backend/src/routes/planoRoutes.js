const router = require('express').Router();
const ctrl = require('../controllers/ControladorPlano');
const auth = require('../middlewares/authMiddleware');

router.use(auth);

router.get('/', ctrl.listar);
router.get('/meu', ctrl.meuPlano);
router.post('/assinar', ctrl.assinar);

module.exports = router;
