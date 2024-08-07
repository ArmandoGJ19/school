import Assistance from "../models/assistance.js";
import User from "../models/User.js";
import Grader from "../models/Grader.js";
import mongoose from "mongoose";

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
                    from: "graders",
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

// Obtener asistencia por ID
export const getAssistanceById = async (req, res) => {
    try {
        const { assistanceId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(assistanceId)) {
            return res.status(400).json({ message: "El ID no es válido." });
        }

        const assistance = await Assistance.findById(assistanceId);
        if (!assistance) {
            return res.status(404).json({ message: "Asistencia no encontrada." });
        }

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
                    from: "graders",
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

        // Validar estudiante
        if (!mongoose.Types.ObjectId.isValid(student) || !await User.findById(student)) {
            return res.status(400).json({ message: "El ID del estudiante no es válido o no existe." });
        }

        // Validar materia
        if (!mongoose.Types.ObjectId.isValid(mateer) || !await Grader.findById(mateer)) {
            return res.status(400).json({ message: "El ID de la materia no es válido o no existe." });
        }

        // Validar profesor
        if (!mongoose.Types.ObjectId.isValid(professor) || !await User.findById(professor)) {
            return res.status(400).json({ message: "El ID del profesor no es válido o no existe." });
        }

        const newAssistance = new Assistance({ student, mateer, professor, dia, asistencia });

        const savedAssistance = await newAssistance.save();
        return res.status(200).json({ message: "Asistencia creada.", savedAssistance });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Error: " + e });
    }
};

// Actualizar una asistencia
export const updateAssistance = async (req, res) => {
    try {
        const { assistanceId } = req.params;
        const { student, mateer, professor, dia, asistencia } = req.body;

        if (!mongoose.Types.ObjectId.isValid(assistanceId)) {
            return res.status(400).json({ message: "El ID no es válido." });
        }

        const assistanceToUpdate = await Assistance.findById(assistanceId);
        if (!assistanceToUpdate) {
            return res.status(404).json({ message: "Asistencia no encontrada." });
        }

        // Validar estudiante
        if (!mongoose.Types.ObjectId.isValid(student) || !await User.findById(student)) {
            return res.status(400).json({ message: "El ID del estudiante no es válido o no existe." });
        }

        // Validar materia
        if (!mongoose.Types.ObjectId.isValid(mateer) || !await Grader.findById(mateer)) {
            return res.status(400).json({ message: "El ID de la materia no es válido o no existe." });
        }

        // Validar profesor
        if (!mongoose.Types.ObjectId.isValid(professor) || !await User.findById(professor)) {
            return res.status(400).json({ message: "El ID del profesor no es válido o no existe." });
        }

        assistanceToUpdate.student = student;
        assistanceToUpdate.mateer = mateer;
        assistanceToUpdate.professor = professor;
        assistanceToUpdate.dia = dia;
        assistanceToUpdate.asistencia = asistencia;

        await assistanceToUpdate.save();
        return res.status(200).json({ message: "Asistencia actualizada.", assistanceToUpdate });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Error: " + e });
    }
};

// Eliminar una asistencia
export const deleteAssistance = async (req, res) => {
    try {
        const { assistanceId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(assistanceId)) {
            return res.status(400).json({ message: "El ID no es válido." });
        }

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
