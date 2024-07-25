//Válidar si el token es válido
import jwt from "jsonwebtoken";
import User from "../models/User.js"
import Role from "../models/Role.js";

export const verifyToken = async (req, res, next) => {
    const secret = process.env.SECRET;
    const token = req.headers['x-access-token'];
    if (token === "null") return res.status(403).json({message: "No se ha proporcionado token."});
    if (!token) return res.status(403).json({message: "No se ha proporcionado： Token."});
    //console.log(token)
    //Extraer la información del token
    const decoded = jwt.verify(token, secret);
    req.userId = decoded.id;
    //console.log(decoded);
    //Buscar el usuario en la base de datos
    const user = await User.findById(req.userId, {password: 0});
    //console.log(user)
    //Validar si el usuario existe
    if (!user) return res.status(404).json({message: "Usuario no encontrado."});
    //Continuar con la siguiente función si el usuario existe
    next();
}

//VERIFICACIÓN DE ROLES
export const isServiciosEscolares = async (req, res, next) => {
    const user = await User.findById(req.userId);
    const roles = await Role.find({ _id: { $in: user.roles } });
    for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === "servicios_escolares") {
            next();
            return;
        }
    }
    res.status(403).json({ message: "Require ser de Servicios Escolares." });
}

export const isMaestro = async (req, res, next) => {
    const user = await User.findById(req.userId);
    const roles = await Role.find({ _id: { $in: user.roles } });
    for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === "profesor") {
            next();
            return;
        }
    }
    res.status(403).json({ message: "Require ser Profesor." });
}

export const isAlumno = async (req, res, next) => {
    const user = await User.findById(req.userId);
    const roles = await Role.find({ _id: { $in: user.roles } });
    for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === "alumno") {
            next();
            return;
        }
    }
    res.status(403).json({ message: "Require ser Alumno." });
}

export const isMaestroServiciosEscolares = async (req, res, next) => {
    const user = await User.findById(req.userId);
    const roles = await Role.find({ _id: { $in: user.roles } });
    for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === "profesor" || roles[i].name === "servicios_escolares") {
            next();
            return;
        }
    }
    res.status(403).json({ message: "Require ser Profesor o Servicios Escolares." });
}