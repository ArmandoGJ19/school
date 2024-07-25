import Grader from "../models/Grader.js";
import User from "../models/User.js";
import Carrer from "../models/Carrer.js";
import mongoose from "mongoose";
export const getGrades = async (req, res) => {
    try {
        //VER TODOS LOS USUARIOS CON SUS ROLES
        const grades = await Grader.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "professor",
                    foreignField: "_id",
                    as: "professor",
                },
            },
            {
                $lookup: {
                    from: "carrers",
                    localField: "career",
                    foreignField: "_id",
                    as: "career",
                },
            },
        ]);
        res.json(grades);
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Error: " + e });
    }
}

export const getGradeById = async (req, res) => {
    try {

        const { gradeId } = req.params;

        //validar el ObjectId
        if (!mongoose.Types.ObjectId.isValid(gradeId)) {
            return res.status(400).json({ message: "El ID no es válido." });
        }

        //validar que exista la materia
        const grade = await Grader.findById(gradeId);
        if (!grade) {
            return res.status(404).json({ message: "La materia no fue encontrada." });
        }

        //CONSULTA QUE MUESTRA LAS MATERIAS BUSCADAS POR SU ID
        const grades = await Grader.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "professor",
                    foreignField: "_id",
                    as: "professor",
                },
            },
            {
                $lookup: {
                    from: "carrers",
                    localField: "career",
                    foreignField: "_id",
                    as: "career",
                },
            },
            { $match: { _id: new mongoose.Types.ObjectId(gradeId) } },
        ]);
        res.json(grades);
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Error: " + e });
    }
}

export const createGrade = async (req, res) => {
    try {
        // EXTRAER LOS DATOS DEL BODY DE LA APLICACIÓN
        const { name, professor, career } = req.body;

        // VALIDAR QUE LOS DATOS NO SE DUPLIQUEN
        const existingGrade = await Grader.findOne({ name, professor: { $in: professor }, career: { $in: career } });
        if (existingGrade) {
            return res.status(400).json({ message: "La materia ya existe." });
        }

        // CREAR UNA NUEVA MATERIA
        const newGrade = new Grader({
            name
        });

        // BUSCAR CARRERA
        if (career && career.length > 0) {
            // Iterar sobre los IDs de carrera en el array
            for (const careerId of career) {
                // Verificar si el ID de la carrera está en un formato válido
                if (!mongoose.Types.ObjectId.isValid(careerId)) {
                    return res.status(400).json({ message: "El ID de la carrera no es válido." });
                }

                // Buscar la carrera en la base de datos
                const foundCareer = await Carrer.findById(careerId);

                // Verificar si la carrera existe
                if (!foundCareer) {
                    return res.status(404).json({ message: "La carrera especificada no existe." });
                }

                newGrade.career.push(foundCareer._id);
            }
        } else {
            return res.status(400).json({ message: "Debe especificar al menos una carrera." });
        }

        // BUSCAR PROFESOR
        if (professor && professor.length > 0) {
            // Iterar sobre los IDs de profesor en el array
            for (const professorId of professor) {
                // Verificar si el ID del profesor está en un formato válido
                if (!mongoose.Types.ObjectId.isValid(professorId)) {
                    return res.status(400).json({ message: "El ID del profesor no es válido." });
                }

                // Buscar al profesor en la base de datos
                const foundUser = await User.findById(professorId);

                // Verificar si el profesor existe
                if (!foundUser) {
                    return res.status(404).json({ message: "El profesor especificado no existe." });
                }

                newGrade.professor.push(foundUser._id);
            }
        } else {
            return res.status(400).json({ message: "Debe especificar al menos un profesor." });
        }

        // SI EL USUARIO NO EXISTE, CREARLO
        const savedGrade = await newGrade.save();

        // DEVOLVER UN MENSAJE DE ÉXITO
        return res.status(200).json({ message: "Materia creada." });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Error: " + e });
    }
}

export const updateGrade = async (req, res) => {
    try {
        const { name, professor, career } = req.body;
        const { gradeId } = req.params;

        //validar el ObjectId
        if (!mongoose.Types.ObjectId.isValid(gradeId)) {
            return res.status(400).json({ message: "El ID no es válido." });
        }

        // VALIDAR QUE LOS DATOS NO SE DUPLIQUEN EXCEPTO PARA ESTA MATERIA
        const existingGrade = await Grader.findOne({ _id: { $ne: gradeId }, name, professor: { $in: professor }, career: { $in: career } });
        if (existingGrade) {
            return res.status(400).json({ message: "Ya existe una materia con este nombre, profesor y carrera." });
        }

        // BUSCAR LA MATERIA A ACTUALIZAR
        const gradeToUpdate = await Grader.findById(gradeId);
        if (!gradeToUpdate) {
            return res.status(404).json({ message: "La materia especificada no existe." });
        }

        // ACTUALIZAR LOS DATOS DE LA MATERIA
        gradeToUpdate.name = name;

        // LIMPIAR Y ACTUALIZAR LOS PROFESORES
        gradeToUpdate.professor = [];
        if (professor && professor.length > 0) {
            for (const professorId of professor) {
                // Verificar si el ID del profesor está en un formato válido
                if (!mongoose.Types.ObjectId.isValid(professorId)) {
                    return res.status(400).json({ message: "El ID del profesor no es válido." });
                }

                // Buscar al profesor en la base de datos
                const foundUser = await User.findById(professorId);

                // Verificar si el profesor existe
                if (!foundUser) {
                    return res.status(404).json({ message: "El profesor especificado no existe." });
                }

                gradeToUpdate.professor.push(foundUser._id);
            }
        } else {
            return res.status(400).json({ message: "Debe especificar al menos un profesor." });
        }

        // LIMPIAR Y ACTUALIZAR LAS CARRERAS
        gradeToUpdate.career = [];
        if (career && career.length > 0) {
            for (const careerId of career) {
                // Verificar si el ID de la carrera está en un formato válido
                if (!mongoose.Types.ObjectId.isValid(careerId)) {
                    return res.status(400).json({ message: "El ID de la carrera no es válido." });
                }

                // Buscar la carrera en la base de datos
                const foundCareer = await Carrer.findById(careerId);

                // Verificar si la carrera existe
                if (!foundCareer) {
                    return res.status(404).json({ message: "La carrera especificada no existe." });
                }

                gradeToUpdate.career.push(foundCareer._id);
            }
        } else {
            return res.status(400).json({ message: "Debe especificar al menos una carrera." });
        }

        // GUARDAR LOS CAMBIOS
        await gradeToUpdate.save();

        // DEVOLVER UN MENSAJE DE ÉXITO
        return res.status(200).json({ message: "Materia actualizada." });

    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Error: " + e });
    }
}

export const deleteGrade = async (req, res) => {
    try {
        const { gradeId } = req.params;

        //validar el ObjectId
        if (!mongoose.Types.ObjectId.isValid(gradeId)) {
            return res.status(400).json({ message: "El ID no es válido." });
        }

        // BUSCAR Y ELIMINAR LA MATERIA
        const deletedGrade = await Grader.findByIdAndDelete(gradeId);

        // VERIFICAR SI SE ELIMINÓ LA MATERIA
        if (!deletedGrade) {
            return res.status(404).json({ message: "Materia no encontrada." });
        }

        // DEVOLVER UN MENSAJE DE ÉXITO
        return res.status(200).json({ message: "Materia eliminada exitosamente." });
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Error: " + e });
    }
}