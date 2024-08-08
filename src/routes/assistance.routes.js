// RUTA PARA LAS ASISTENCIAS
import * as assistanceController from '../controllers/assistance.controller.js';
import { Router } from 'express';
import { authJwt } from "../middlewares/index.js";

const router = Router();

// RUTAS PARA LAS ASISTENCIAS
router.get('/', assistanceController.getAssistances);
router.get('/:assistanceId', assistanceController.getAssistanceById);
router.post('/', [authJwt.verifyToken, authJwt.isServiciosEscolares], assistanceController.createAssistance);
router.put('/:assistanceId', [authJwt.verifyToken, authJwt.isServiciosEscolares], assistanceController.updateAssistance);
router.delete('/:assistanceId', [authJwt.verifyToken, authJwt.isServiciosEscolares], assistanceController.deleteAssistance);

export default router;
