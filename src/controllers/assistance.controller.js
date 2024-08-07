import Assistance from '../models/assistance.model.js';
import User from '../models/User.js';
import Carrer from '../models/Carrer.js';
import mongoose from 'mongoose';

// Obtener todas las asistencias
export const getAssistances = async (req, res) => {
    try {
        const assistances = await Assistance.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "student",
                    foreignField: "_id",
                    as: "student",
                },
            },
            {
                $lookup: {
                    from: "carrers",
                    localField: "mateer",
                    foreignField: "_id",
                    as: "mateer",
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "professor",
                    foreignField: "_id",
                    as: "professor",
                },
            },
        ]);
        res.json(assistances);
    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Error: " + e });
    }
};

// Obtener una asistencia por ID
export const getAssistanceById = async (req, res) => {
    try {
        const { assistanceId } = req.params;

        // Validar el ObjectId
        if (!mongoose.Types.ObjectId.isValid(assistanceId)) {
            return res.status(400).json({ message: "El ID no es válido." });
        }

        // Buscar la asistencia por ID
        const assistance = await Assistance.findById(assistanceId);
        if (!assistance) {
            return res.status(404).json({ message: "Asistencia no encontrada." });
        }

        // Consulta detallada de la asistencia por ID
        const assistances = await Assistance.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "student",
                    foreignField: "_id",
                    as: "student",
                },
            },
            {
                $lookup: {
                    from: "carrers",
                    localField: "mateer",
                    foreignField: "_id",
                    as: "mateer",
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "professor",
                    foreignField: "_id",
                    as: "professor",
                },
            },
            { $match: { _id: new mongoose.Types.ObjectId(assistanceId) } },
        ]);
        res.json(assistances);
    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Error: " + e });
    }
};

// Crear una nueva asistencia
export const createAssistance = async (req, res) => {
    try {
        const { student, mateer, professor, dia, asistencia } = req.body;

        // Validar que los datos no se dupliquen
        const existingAssistance = await Assistance.findOne({ student, mateer, professor, dia });
        if (existingAssistance) {
            return res.status(400).json({ message: "La asistencia ya existe." });
        }

        // Crear una nueva asistencia
        const newAssistance = new Assistance({
            student,
            mateer,
            professor,
            dia,
            asistencia
        });

        // Guardar la asistencia
        const savedAssistance = await newAssistance.save();

        return res.status(200).json({ message: "Asistencia creada.", assistance: savedAssistance });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Error: " + e });
    }
};

// Actualizar una asistencia
export const updateAssistance = async (req, res) => {
    try {
        const { student, mateer, professor, dia, asistencia } = req.body;
        const { assistanceId } = req.params;

        // Validar el ObjectId
        if (!mongoose.Types.ObjectId.isValid(assistanceId)) {
            return res.status(400).json({ message: "El ID no es válido." });
        }

        // Buscar la asistencia a actualizar
        const assistanceToUpdate = await Assistance.findById(assistanceId);
        if (!assistanceToUpdate) {
            return res.status(404).json({ message: "La asistencia especificada no existe." });
        }

        // Actualizar los datos de la asistencia
        assistanceToUpdate.student = student;
        assistanceToUpdate.mateer = mateer;
        assistanceToUpdate.professor = professor;
        assistanceToUpdate.dia = dia;
        assistanceToUpdate.asistencia = asistencia;

        // Guardar los cambios
        const updatedAssistance = await assistanceToUpdate.save();

        return res.status(200).json({ message: "Asistencia actualizada.", assistance: updatedAssistance });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Error: " + e });
    }
};

// Eliminar una asistencia
export const deleteAssistance = async (req, res) => {
    try {
        const { assistanceId } = req.params;

        // Validar el ObjectId
        if (!mongoose.Types.ObjectId.isValid(assistanceId)) {
            return res.status(400).json({ message: "El ID no es válido." });
        }

        // Buscar y eliminar la asistencia
        const deletedAssistance = await Assistance.findByIdAndDelete(assistanceId);

        if (!deletedAssistance) {
            return res.status(404).json({ message: "Asistencia no encontrada." });
        }

        return res.status(200).json({ message: "Asistencia eliminada exitosamente." });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Error: " + e });
    }
};
