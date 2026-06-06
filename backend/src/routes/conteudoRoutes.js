const router = require('express').Router();
const ctrl = require('../controllers/ControladorNavegacao');
const auth = require('../middlewares/authMiddleware');

router.use(auth);

router.get('/ano/:ano', ctrl.listarPorAno);
router.get('/buscar', ctrl.buscar);
router.get('/laboratorios', ctrl.laboratoriosPermitidos);

module.exports = router;
