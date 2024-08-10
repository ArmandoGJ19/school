//VER TODOS LOS USUARIOS
import User from "../models/User.js";
import Role from "../models/Role.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

//VER TODOS LOS USUARIOS
export const getUsers = async (req, res) => {
    try {
        //VER TODOS LOS USUARIOS CON SUS ROLES
        const users = await User.aggregate([
            {
                $lookup: {
                    from: "roles",
                    localField: "roles",
                    foreignField: "_id",
                    as: "roles",
                },
            },
        ]);
        res.json(users);
    } catch (e) {
        console.log(e)
    }
}

//VER USUARIO POR ID
export const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;

        //validar el ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "El ID del usuario no es válido." });
        }

        //Usuario no encontrado
        const userIdExist = await User.findById(userId);
        if (!userIdExist) {
            return res.status(400).json({ message: "El usuario no fue encontrado." });
        }

        //const user = await User.findById(userId);
        //CONSULTA QUE MUESTRA EL USUARIO BUSCADO POR SU ID CON SUS ROLES
        const user = await User.aggregate([
            {
                $lookup: {
                    from: "roles",
                    localField: "roles",
                    foreignField: "_id",
                    as: "roles",
                },
            },
            { $match: { _id: new mongoose.Types.ObjectId(userId) } },
        ]);

        res.json(user);
    } catch (e) {
        console.log(e)
    }
}

//Ver usuarios con rol de alumnos
export const getStudents = async (req, res) => {
    try {
        const students = await User.aggregate([
            {
                $lookup: {
                    from: "roles",
                    localField: "roles",
                    foreignField: "_id",
                    as: "roles",
                },
            },
            { $match: { roles: { $elemMatch: { name: "alumno" } } } },
        ]);
        res.json(students);
    } catch (e) {
        console.log(e)
    }
}

//Ver usuarios con rol de profesor
export const getTeachers = async (req, res) => {
    try {
        const teachers = await User.aggregate([
            {
                $lookup: {
                    from: "roles",
                    localField: "roles",
                    foreignField: "_id",
                    as: "roles",
                },
            },
            { $match: { roles: { $elemMatch: { name: "profesor" } } } },
        ]);
        res.json(teachers);
    } catch (e) {
        console.log(e)
    }
}

// Función para generar un studentId de 10 dígitos
const generateStudentId = () => {
    const year = new Date().getFullYear().toString(); // Obtiene el año actual y lo convierte en una cadena
    let studentId = year; // Inicializa el studentId con el año actual

    // Genera 6 dígitos aleatorios y los concatena en el studentId
    for (let i = 0; i < 6; i++) {
        studentId += Math.floor(Math.random() * 10); // Agrega un dígito aleatorio al studentId
    }

    return studentId; // Devuelve el studentId generado
};

//AGREGAR USUARIO
export const createUser = async (req, res) => {
    try {
        // EXTRAER LOS DATOS DEL BODY DE LA APLICACIÓN
        const { name, lastname, email, password, CURP, roles } = req.body;

        // VALIDAR QUE EL USUARIO NO EXISTA
        let userExist;
        if (CURP != undefined) {
            userExist = await User.findOne({ CURP });
        } else {
            userExist = await User.findOne({ email });
        }

        // SI EL USUARIO YA EXISTE, DEVOLVER UN MENSAJE DE ERROR
        if (userExist) {
            return res.status(400).json({ message: "El usuario ya fue registrado." });
        }

        // Genera un nuevo studentId
        const studentId = generateStudentId();

        //VALIDAR QUE NO VENGAN TODOS LOS CAMPOS
        if (req.body.CURP && req.body.email && req.body.password) {
            return res.status(400).json({ message: "No se pueden enviar CURP, email y password en el mismo request." });
        } else if (req.body.CURP && req.body.password) {
            return res.status(400).json({ message: "No se pueden enviar CURP y password en el mismo request." });
        } else if (req.body.email && req.body.CURP) {
            return res.status(400).json({ message: "No se pueden enviar email y password en el mismo request." });
        }

        let newUser;
        if (CURP == null) {
            newUser = new User({
                name,
                lastname,
                email,
                password: await User.encryptPassword(password)
            });
        } else {
            newUser = new User({
                name,
                lastname,
                CURP,
                studentId
            });
        }

        //Condicional para asignar roles, en caso de no contar con roles, se asigna el rol de profesor
        if(req.body.roles) {
            const foundRoles = await Role.find({ name: { $in: roles }});
            //Buscar el rol, si no se encuentra sale un error de no encontrado
            if (foundRoles.length === 0) {
                return res.status(400).json({ message: "El rol del usuario no fue encontrado." });
            }
            //Validar que con el CURP no se acepta el rol de profesor y servicios escolares
            if (CURP && (roles.includes("profesor") || roles.includes("servicios_escolares") || roles.includes("servicios escolares"))) {
                return res.status(400).json({ message: "No se puede asignar el rol de profesor o servicios escolares con CURP." });
            }
            //Validar que con el email y password no se acepta el rol de alumno
            if (email && password && roles.includes("alumno")) {
                return res.status(400).json({ message: "No se puede asignar el rol de alumno con email y password." });
            }
            newUser.roles = foundRoles.map(role => role._id);
        } else {
            if (CURP != null) {
                const role = await Role.findOne({ name: "alumno"});
                newUser.roles = [role._id];
            } else {
                const role = await Role.findOne({ name: "profesor"});
                newUser.roles = [role._id];
            }
        }

        // SI EL USUARIO NO EXISTE, CREARLO
        const savedUser = await newUser.save();

        // DEVOLVER UN MENSAJE DE ÉXITO
        return res.status(200).json({
            message: "Usuario creado.",
            studentId: savedUser.studentId,
            user: savedUser
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Error al crear usuario." });
    }
}

//EDITAR USUARIO
export const updateUserById = async (req, res) => {
    try {
        // EXTRAER LOS DATOS DEL BODY DE LA APLICACIÓN
        const { userId } = req.params;
        const { name, lastname, email, password, studentId, CURP, roles } = req.body;

        //validar el ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "El ID del usuario no es válido." });
        }

        // VALIDAR QUE EL USUARIO EXISTA
        const userExist = await User.findById(userId);

        // SI EL USUARIO YA EXISTE, DEVOLVER UN MENSAJE DE ERROR
        if (!userExist) {
            return res.status(400).json({ message: "El usuario no fue encontrado." });
        }

        //VALIDAR QUE NO VENGAN TODOS LOS CAMPOS
        if (req.body.CURP && req.body.email && req.body.password) {
            return res.status(400).json({ message: "No se pueden enviar CURP, email y password en el mismo request." });
        } else if (req.body.CURP && req.body.password) {
            return res.status(400).json({ message: "No se pueden enviar CURP y password en el mismo request." });
        } else if (req.body.email && req.body.CURP) {
            return res.status(400).json({ message: "No se pueden enviar email y password en el mismo request." });
        }

        const updatedUserData = {
            name,
            lastname,
            email,
            studentId,
            CURP
        };


        //Validar que haya una nueva contraseña si no se proporcionó antes
        if (!userExist.password && !password && (CURP != undefined)) {
            return res.status(400).json({ message: "La nueva contraseña es obligatoria." });
        }
        // SI SE PROPORCIONA UNA NUEVA CONTRASEÑA, ACTUALIZARLA
        if (password) {
            updatedUserData.password = await User.encryptPassword(password);
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updatedUserData, { new: true });
        if (req.body.roles) {
            const foundRoles = await Role.find({ name: { $in: roles }});
            //Buscar el rol, si no se encuentra sale un error de no encontrado
            if (foundRoles.length === 0) {
                return res.status(400).json({ message: "El rol del usuario no fue encontrado." });
            }
            //Validar que con el CURP no se acepta el rol de profesor y servicios escolares
            if (CURP && (roles.includes("profesor") || roles.includes("servicios_escolares") || roles.includes("servicios escolares"))) {
                return res.status(400).json({ message: "No se puede asignar el rol de profesor o servicios escolares con CURP." });
            }
            //Validar que con el email y password no se acepta el rol de alumno
            if (email && password && roles.includes("alumno")) {
                return res.status(400).json({ message: "No se puede asignar el rol de alumno con email y password." });
            }
            updatedUser.roles = foundRoles.map(role => role._id);
        } else {
            if (CURP) {
                const role = await Role.findOne({ name: "alumno" });
                updatedUser.roles = [role._id];
            } else {
                const role = await Role.findOne({ name: "profesor" });
                updatedUser.roles = [role._id];
            }
        }

        //Buscar el rol
        const rolesName = await Role.find({ _id: { $in: updatedUser.roles }});
        if (rolesName[0].name === "alumno"){
            // Actualizar el documento para quitar los campos email y password
            await User.updateOne(
                { _id: updatedUser._id },
                { $unset: { password: 1 } }
            );
            //verificar que exista el studentId
            if (!updatedUser.studentId) {
                // Genera un nuevo studentId
                const studentId = generateStudentId();
                updatedUser.studentId = studentId;
            }
        } else if (rolesName[0].name === "profesor" || rolesName[0].name === "servicios_escolares") {
            // Actualizar el documento para quitar los campos studentId y CURP
            await User.updateOne(
                { _id: updatedUser._id },
                { $unset: { studentId: 1, CURP: 1 } }
            );
            updatedUser.studentId = undefined;
            updatedUser.CURP = undefined;
        }
        // SI EL USUARIO NO EXISTE, CREARLO
        const savedUser = await updatedUser.save();
        // DEVOLVER UN MENSAJE DE ÉXITO
        return res.status(200).json({
            message: "Usuario actualizado.",
            studentId: savedUser.studentId,
            user: savedUser
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Error al crear usuario." });
    }
}

//ELIMINAR USUARIO
export const deleteUserById = async (req, res) => {
    try {
        const { userId } = req.params;

        //validar el ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "El ID del usuario no es válido." });
        }

        // VALIDAR QUE EL USUARIO EXISTA
        const userExist = await User.findById(userId);

        // SI EL USUARIO NO EXISTE
        if (!userExist) {
            return res.status(400).json({ message: "El usuario no fue encontrado." });
        }

        // ELIMINAR EL USUARIO
        const deletedUser = await User.findByIdAndDelete(userId);
        return res.status(200).json({ message: "Usuario eliminado." });
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Error al eliminar usuario.", error: e });
    }
}

// Cambio de contraseña con email
export const searchEmail = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "El usuario no fue encontrado." });
        }
        const data = {
            name: user.name,
            lastname: user.lastname,
            email: user.email,
        }
        console.log(data)
        return res.status(200).json({ message: "Email enviado. ", data });
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Error al buscar usuario.", error: e });
    }
}

export const resetPasswordEmail = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "El usuario no fue encontrado." });
        }

        const passEncrypt = await User.encryptPassword(password);

        await User.updateOne(
            { _id: user._id },
            { $set: { password: passEncrypt } }
        );

        return res.status(200).json({ message: "Contraseña actualizada. " });
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Error al editar usuario.", error: e });
    }
}

// Cambio de contraseña con token
export const resetPasswordToken = async (req, res) => {
    try {
        const token = req.headers['x-access-token'];
        const { password } = req.body;
        const secret = process.env.SECRET;
        const decoded = jwt.verify(token, secret);
        const user = await User.findById(decoded.id);
        const passEncrypt = await User.encryptPassword(password);

        await User.updateOne(
            { _id: user._id },
            { $set: { password: passEncrypt } }
        );

        return res.status(200).json({ message: "Contraseña actualizada. " });
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Error al editar usuario.", error: e });
    }
}

// Traer los role
export const getAllRoles = async (req, res) => {
    try {
        const roles = await Role.find()
        console.log(roles)
        return res.status(200).json({ message: "Roles encontrados.", roles: roles });
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Error al traer roles.", error: e });
    }
}