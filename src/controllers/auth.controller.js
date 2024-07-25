//MODELOS DE USUARIO
import User from "../models/User.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import {token} from "morgan";

dotenv.config();
const secret = process.env.SECRET;

//FUNCIÓN PARA INICIAR SESIÓN
export const signin = async (req, res) => {
    try {
        //Extraer los datos del cuerpo de la aplicación
        const { email, password, studentId, CURP } = req.body;

        //EN CASO DE RECIBIR LOS 4 DATOS
        if (email && password && studentId && CURP) {
            return res.status(400).json({ message: "Error en los datos envíados." });
        }

        //VERIFICAR SI ES ALUMNO, PROFESOR O SERVICIOS ESCOLARES
        if (studentId || CURP) {
            signinStudents(res, studentId, CURP)
        } else if (email || password) {
            signinTeachersAndSchools(res, email, password)
        } else {
            return res.status(400).json({ message: "No se ha proporcionado correo o contraseña." });
        }

    } catch (e) {
        console.log(e)
    }
}

//FUNCIÓN PARA INICIO DE SESIÓN DE ALUMNOS
async function signinStudents(res, studentId, CURP) {

    //BUSCAR ALUMNO POR CURP y MATRICULA
    const userFound = await User.findOne({studentId, CURP}).populate("roles");
    if (!userFound) {
        return res.status(400).json({message: "El usuario no existe."});
    }
    //console.log("el usuario es: " + userFound)

    //GENERAR EL TOKEN
    const token = tokenGenerate(userFound);
    //console.log("el token es: " + token)
    res.status(200).json({ token });
}

//FUNCIÓN PARA INICIO DE SESIÓN DE PROFESORES Y SERVICIOS ESCOLARES
async function signinTeachersAndSchools(res, email, password) {

    //BUSCAR USUARIO POR CORREO
    const userFound = await User.findOne({email}).populate("roles");
    if (!userFound) {
        return res.status(400).json({message: "El usuario no existe."});
    }
    //console.log("el usuario es: " + userFound)

    //INICIAR SESIÓN
    const newUser = await User.comparePassword(password, userFound.password);
    if (!newUser) {
        return res.status(401).json({message: "La contraseña inválida."});
    }

    //GENERAR EL TOKEN
    const token = tokenGenerate(userFound);
    //console.log("el token es: " + token)
    res.status(200).json({ token });
}

//FUNCIÓN QUE GENERA EL TOKEN
function tokenGenerate(userFound) {
    const token = jwt.sign({ id: userFound._id, name: userFound.name, lastname: userFound.lastname }, secret, {
        expiresIn: 86400 // 24 Horas
    });
    return token
}