//RUTA PARA AUTENTICAR USUARIOS
import { Router } from 'express';
const router = Router();

import * as authCtrl from "../controllers/auth.controller.js";

// router.get("/", (req, res) =>
//     res.json({message: 'Ruta de autenticación'})
// );
router.post('/signin', authCtrl.signin)

export default router