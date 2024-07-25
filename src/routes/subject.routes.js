//RUTA PARA LAS CALIFICACIONES
import * as subjectController from '../controllers/subjects.controller.js';
import { Router } from 'express';
import {editSubject} from "../controllers/subjects.controller.js";
import { authJwt } from "../middlewares/index.js";
const router = Router();

// router.get("/", (req, res) =>
//     res.json({message: 'Ruta de calificaciones'})
// );

router.get('/', [authJwt.verifyToken], subjectController.getSubjects)
router.get('/:subjectId', [authJwt.verifyToken], subjectController.getSubject)
router.post('/', [authJwt.verifyToken, authJwt.isMaestroServiciosEscolares], subjectController.createSubject)
router.put('/:subjectId', [authJwt.verifyToken, authJwt.isMaestroServiciosEscolares], subjectController.editSubject)
router.delete('/:subjectId', [authJwt.verifyToken, authJwt.isMaestroServiciosEscolares], subjectController.deleteSubject)

export default router
