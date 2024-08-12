//RUTA PARA LAS MATERIAS DE CLASES
import * as graphicsController from '../controllers/graphics.controller.js';
import { Router } from 'express';
import { authJwt } from "../middlewares/index.js";
const router = Router();

// router.get("/", (req, res) =>
//     res.json({message: 'Ruta de materias'})
// );

//RUTA PARA LAS MATERIAS DE CLASES
router.get('/graphic1', graphicsController.graphics);
router.get('/graphic2', graphicsController.graphics2);

export default router