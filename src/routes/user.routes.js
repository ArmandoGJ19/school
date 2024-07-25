//RUTA PARA LOS USUARIOS (MAESTROS, SERVICIOS ESCOLARES, ALUMNOS)
import { Router } from 'express';
const router = Router();

import * as userController from '../controllers/users.controller.js';
import { authJwt } from "../middlewares/index.js";

//RUTA POR METODO GET
// router.get("/", (req, res) =>
//     res.json({message: 'Ruta de usuarios'})
// );

//RUTA PARA LOS USUARIOS
router.get('/', [authJwt.verifyToken, authJwt.isServiciosEscolares], userController.getUsers);
router.get('/students', [authJwt.verifyToken, authJwt.isMaestroServiciosEscolares], userController.getStudents);
router.get('/profesor', userController.getTeachers);
router.get('/roles/users', [authJwt.verifyToken, authJwt.isServiciosEscolares], userController.getAllRoles)
router.get('/:userId', [authJwt.verifyToken], userController.getUserById);
//router.post('/', [authJwt.verifyToken, authJwt.isServiciosEscolares], userController.createUser);
router.post('/', userController.createUser);
router.put('/:userId', [authJwt.verifyToken, authJwt.isServiciosEscolares], userController.updateUserById);
router.delete('/:userId', [authJwt.verifyToken, authJwt.isServiciosEscolares], userController.deleteUserById);

router.post('/search-email', userController.searchEmail);
router.post('/reset-password-email', userController.resetPasswordEmail);
router.post('/reset-password-token', [authJwt.verifyToken, authJwt.isServiciosEscolares], userController.resetPasswordToken);

export default router
