import Carrer from "../models/Carrer.js";
import Subject from "../models/Subject.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import Role from "../models/Role.js";
import jwt from "jsonwebtoken";


export const graphics2 = async (req, res) => {
    try {
        const careers = await Carrer.find();

        const subjects = await allSubjects();

        const careerCounts = {};

        careers.forEach(career => {
            const studentsInCareer = subjects.filter(subject => {
                const isMatch = subject.grade.some(grade => {
                    const careerIds = grade.career.map(id => id.toString());
                    const currentCareerId = career._id.toString();
                   
                    return careerIds.includes(currentCareerId);
                });
                return isMatch;
            });

           

            const uniqueStudents = new Set(studentsInCareer.flatMap(subject => 
                subject.student.map(student => student._id.toString())
            ));
            careerCounts[career.name] = uniqueStudents.size;
        });
        res.status(200).json(careerCounts);
    } catch (error) {
        return res.status(500).json({ message: "Error: " + error });
    }
};

export const graphics = async (req, res) => {
    try {
        let subjects;
           subjects = await allSubjects();
        const gradesCount = {
            '10': 0,
            '9': 0,
            '8': 0,
            '7': 0,
            '6': 0,
            '5': 0,
        };

        subjects.forEach(subject => {
            const grade = subject.subject; 
            if (gradesCount[grade] !== undefined) {
                gradesCount[grade]++;
            }
        });
        res.status(200).json(gradesCount);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

//FUNCION QUE TRAE EL TOKEN PARA FILTRAR LAS CALIFICACIONES
async function getToken(req) {
    const token = req.headers['x-access-token'];
    const decoded = jwt.verify(token, process.env.SECRET);
    const user = await User.findById(decoded.id, { password: 0 });
    return user;
}

//FUNCIÓN QUE TRAE TODAS LAS CALIFICACIONES
async function allSubjects() {
    const subjects = await Subject.aggregate([
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
                localField: "grade",
                foreignField: "_id",
                as: "grade",
            },
        },
    ]);

    if (!subjects) {
        return "No hay calificaciones";
    }
    return subjects;
}
