import Carrer from "../models/Carrer.js";
import mongoose from "mongoose";
import Grader from "../models/Grader.js";

//Ver todas las carreras
export const getCareers = async (req, res) => {
    try {
        const careers = await Carrer.find();
        res.json(careers);
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Error: " + e });
    }
}

//Ver carrera por ID
export const getCareerById = async (req, res) => {
    try {
        const { careerId } = req.params;

        //validar el ObjectId
        if (!mongoose.Types.ObjectId.isValid(careerId)) {
            return res.status(400).json({ message: "El ID de la carrera no es válido." });
        }

        //validar que exista la carrera
        const career = await Carrer.findById(careerId);
        if (!career) {
            return res.status(404).json({ message: "La carrera no fue encontrada." });
        }

        //Usuario no encontrado
        if (!career) {
            return res.status(400).json({ message: "La carrera no fue encontrada." });
        }

        res.json(career);
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Error: " + e });
    }
}

// Envíar la carrera con las materias que se le asignan
export const careerInfo = async (req, res) => {
    try {
        const { careerId } = req.params;

        //validar el ObjectId
        if (!mongoose.Types.ObjectId.isValid(careerId)) {
            return res.status(400).json({ message: "El ID no es válido." });
        }

        //validar que exista la carrera
        const career = await Carrer.findById(careerId).select('name');
        if (!career) {
            return res.status(404).json({ message: "La carrera no fue encontrada." });
        }

        const graders = await Grader.find({ career: careerId })
            .populate('professor', 'name')
            .select('name professor');

        res.json({ career, graders });
    } catch (e) {
        return res.status(500).json({ message: "Error: " + e });
    }
}

//Agregar carrera
export const createCareer = async (req, res) => {
    try {
        //parametros de la ruta
        const { name } = req.body;

        //carrera existente
        const careerExist = await Carrer.findOne({ name });
        if (careerExist) {
            return res.status(400).json({ message: "La carrera ya existe." });
        }

        //accion de creacion
        const newCareer = new Carrer({ name });
        await newCareer.save();
        res.json({ message: "La carrera fue agregada con exito.", newCareer });
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Error: " + e });
    }
}

//Actualizar carrera
export const updateCareer = async (req, res) => {

    try {
        //parametros de la ruta
        const { name } = req.body;
        const { careerId } = req.params;

        //validar el ObjectId
        if (!mongoose.Types.ObjectId.isValid(careerId)) {
            return res.status(400).json({ message: "El ID de la carrera no es válido." });
        }

        //carrera no en contrada
        const careerIdExist = await Carrer.findById(careerId);
        if (!careerIdExist) {
            return res.status(404).json({ message: "La carrera no fue encontrada." });
        }

        //carrera existente
        const careerExist = await Carrer.findOne({ name });
        if (careerExist) {
            return res.status(400).json({ message: "La carrera ya existe." });
        }

        //accion de actualizacion
        const career = await Carrer.findByIdAndUpdate(careerId, { name });
        res.json({ message: "La carrera fue actualizada con exito." });
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Error: " + e });
    }

}

//Eliminar carrera
export const deleteCareer = async (req, res) => {
    try {
        //parametros de la ruta
        const { careerId } = req.params;

        //validar el ObjectId
        if (!mongoose.Types.ObjectId.isValid(careerId)) {
            return res.status(400).json({ message: "El ID de la carrera no es válido." });
        }

        //carrera no en contrada
        const careerIdExist = await Carrer.findById(careerId);
        if (!careerIdExist) {
            return res.status(404).json({ message: "La carrera no fue encontrada." });
        }

        //accion de eliminar
        const deletedCareer = await Carrer.findByIdAndDelete(careerId);
        res.json({ message: "La carrera fue eliminada con exito." });
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Error: " + e });
    }
}
