//RUTA PARA LAS MATERIAS DE CLASES
import * as graderController from '../controllers/grades.controller.js';
import { Router } from 'express';
import { authJwt } from "../middlewares/index.js";
const router = Router();

// router.get("/", (req, res) =>
//     res.json({message: 'Ruta de materias'})
// );

//RUTA PARA LAS MATERIAS DE CLASES
router.get('/', graderController.getGrades);
router.get('/:gradeId', graderController.getGradeById);
router.post('/', [authJwt.verifyToken, authJwt.isServiciosEscolares], graderController.createGrade);
router.put('/:gradeId', [authJwt.verifyToken, authJwt.isServiciosEscolares], graderController.updateGrade);
router.delete('/:gradeId', [authJwt.verifyToken, authJwt.isServiciosEscolares], graderController.deleteGrade);
export default router