//RUTA PARA LAS CARRERAS
import * as carreerController from '../controllers/careers.controller.js';
import { Router } from 'express';
import { authJwt } from "../middlewares/index.js";
import {careerInfo} from "../controllers/careers.controller.js";
const router = Router();

// router.get("/", (req, res) =>
//     res.json({message: 'Ruta de carreras'})
// );

//RUTA PARA LAS CARRERAS
router.get('/', carreerController.getCareers);
router.get('/:careerId', carreerController.getCareerById);
router.get('/info/:careerId', carreerController.careerInfo);
router.post('/', [authJwt.verifyToken, authJwt.isServiciosEscolares], carreerController.createCareer);
router.put('/:careerId', [authJwt.verifyToken, authJwt.isServiciosEscolares], carreerController.updateCareer);
router.delete('/:careerId', [authJwt.verifyToken, authJwt.isServiciosEscolares], carreerController.deleteCareer);

export default router
