const router = require('express').Router();
const matCtrl = require('../controllers/ControladorMaterial');
const dlCtrl = require('../controllers/ControladorDownload');
const auth = require('../middlewares/authMiddleware');

router.use(auth);

router.get('/tema/:idConteudo', matCtrl.listarPorTema);
router.get('/laboratorio/:id/acessar', matCtrl.acessarLaboratorio);
router.get('/:idMaterial/download', dlCtrl.baixarPDF);

module.exports = router;
