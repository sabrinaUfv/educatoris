const router = require('express').Router();
const matCtrl = require('../controllers/ControladorMaterial');
const dlCtrl = require('../controllers/ControladorDownload');
const auth = require('../middlewares/authMiddleware');

router.use(auth);

router.get('/tema/:idConteudo', matCtrl.listarPorTema);
router.get('/minhas-reservas', matCtrl.minhasReservas);
router.put('/reserva/:reservaId', matCtrl.atualizarReserva);
router.delete('/reserva/:reservaId', matCtrl.deletarReserva);
router.get('/laboratorio/:id/acessar', matCtrl.acessarLaboratorio);
router.get('/laboratorio/:id/disponibilidade', matCtrl.disponibilidadeLaboratorio);
router.get('/laboratorio/:id/reservas', matCtrl.listarReservasLaboratorio);
router.post('/laboratorio/:id/reservar', matCtrl.reservarLaboratorio);
router.post('/laboratorio/:id/iniciar-uso', matCtrl.iniciarUsoLaboratorio);
router.post('/laboratorio/:id/manter-uso', matCtrl.manterUsoLaboratorio);
router.post('/laboratorio/:id/encerrar-uso', matCtrl.encerrarUsoLaboratorio);
router.get('/:idMaterial/download', dlCtrl.baixarPDF);

module.exports = router;
