
//Ver todas las calificaciones
//Agregar calificaciones
import Subject from "../models/Subject.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import Role from "../models/Role.js";
import Grader from "../models/Grader.js";
import jwt from "jsonwebtoken";
import { transporter } from "../libs/correos.js";



//VER TODAS LAS CALIFICACIONES
export const getSubjects = async (req, res) => {
    try {
        const user = await getToken(req)
        //BUSCAR ROL
        const roles = await Role.find({ _id: { $in: user.roles } });
        const role = roles[0].name
        let subjects;

        //TRAER SOLO CALIFICACIONES DE ALUMNO
        if (role === "alumno") {
            subjects = await studentSubjects(user._id);
        }
        //TRAER TODAS LAS CALIFICACIONES
        else if (role === "profesor" || role === "servicios_escolares") {
           subjects = await allSubjects();
        } else {
            return res.status(401).json({ message: "No autorizado." });
        }

        res.status(200).json(subjects);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

// VER CALIFICACIÓN POR ALUMNO
export const getSubject = async (req, res) => {
    try {
        const id = req.params.subjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "El ID no es válido." });
        }
        const subjects = await studentSubjects(id);
        return res.status(200).json(subjects);
    } catch (e) {
        res.status(404).json({ message: e.message });
    }
}

export const createSubject = async (req, res) => {
    try {
        const { student, parcial, grado, grade, subject } = req.body;

        var tienecorreo='prueba';
        var infocorreo='prueba';
        
        //VALIDACIONES
        if (!student || !parcial || !grado || !grade || !subject) {
            return res.status(400).json({ message: "Todos los campos son obligatorios." });
        }
        if (parcial < 1 || parcial > 2) {
            return res.status(400).json({ message: "El parcial debe ser entre 1 y 2." });
        }
        if (grado < 1 || grado > 10) {
            return res.status(400).json({ message: "El grado debe ser entre 1 y 10." });
        }
        if (subject < 1 || subject > 10) {
            return res.status(400).json({ message: "La materia debe ser entre 1 y 10." });
        }
        const existingSubjects = await Subject.findOne({ parcial, grado, subject, student: { $in: student }, grade: { $in: grade } });
        if (existingSubjects) {
            return res.status(400).json({ message: "La calificación ya fué registrada." });
        }
        //VALIDACIONES

        // Crea un nuevo objeto de Subject con los datos proporcionados
        const newSubject = new Subject({
            parcial,
            grado,
            subject,
        });

        // BUSCAR ESTUDIANTE
        if (student && student.length > 0) {
            // Iterar sobre los IDs de carrera en el array
            for (const studentId of student) {
                // Verificar si el ID de la carrera está en un formato válido
                if (!mongoose.Types.ObjectId.isValid(studentId)) {
                    return res.status(400).json({ message: "El ID no es válido." });
                }

                // Buscar la carrera en la base de datos
                const foundUser = await User.findById(studentId);

                // Verificar si el estudiante existe
                if (!foundUser) {
                    return res.status(404).json({ message: "El estudiante no encontrado." });
                }

                //Verificar que el usuario sea un estudiante
                const foundRoles = await Role.find({ _id: { $in: foundUser.roles[0] } });
                const roleName = foundRoles[0].name;

                if (roleName !== "alumno") {
                    return res.status(400).json({ message: "El usuario no es un estudiante." });
                }

                newSubject.student.push(foundUser._id);
            }
        } else {
            return res.status(400).json({ message: "Debe especificar un estudiante." });
        }

        //BUSCAR MATERIA
        if (grade && grade.length > 0) {
            // Iterar sobre los IDs de carrera en el array
            for (const gradeId of grade) {
                // Verificar si el ID de la carrera está en un formato válido
                if (!mongoose.Types.ObjectId.isValid(gradeId)) {
                    return res.status(400).json({ message: "El ID no es válido." });
                }

                // Buscar la carrera en la base de datos
                const foundGrade = await Grader.findById(gradeId);

                // Verificar si el estudiante existe
                if (!foundGrade) {
                    return res.status(404).json({ message: "Materia no encontrada." });
                }

                newSubject.grade.push(foundGrade._id);
            }
        } else {
            return res.status(400).json({ message: "Debe especificar una materia." });
        }

        // Si el parcial es 2, calcular la calificación final y determinar si aprueba o reprueba
        // if (parcial === 2) {
        //     let totalCalification = 0;
        //     let subjectCount = 0;
        //
        //     // Sumar las calificaciones de todas las materias del primer y segundo parcial
        //     for (const gradeId of grade) {
        //         const foundSubjects = await Subject.find({ grade: gradeId }); // Buscar los sujetos asociados al grado
        //         for (const foundSubject of foundSubjects) {
        //             if (foundSubject.parcial === 1 || foundSubject.parcial === 2) {
        //                 totalCalification += foundSubject.subject; // Sumar la calificación del sujeto
        //                 subjectCount++;
        //             }
        //         }
        //     }
        //
        //     // Sumar la calificación proporcionada en el JSON
        //     totalCalification += req.body.subject;
        //
        //     // Incrementar el contador de materias
        //     subjectCount++;
        //
        //     // Calcular el promedio de las calificaciones
        //     const averageCalification = totalCalification / subjectCount;
        //
        //     // Verificar si el estudiante aprueba o reprueba
        //     let status;
        //     if (averageCalification >= 8) {
        //         status = "Aprobado";
        //     } else {
        //         status = "Reprobado";
        //     }
        //
        //     // Asignar la calificación final y el estado al nuevo objeto de Subject
        //     newSubject.finalScore = averageCalification;
        //     newSubject.status = status;
        //
        // }
        console.log(parcial);
        if (parcial == 2) {
            console.log("Buscando calificaciones del primer parcial para el grado:", grado, "y la materia:", grade);
            const foundSubjects = await Subject.find({ grade: grade, parcial: 1, grado: grado, student: student });
            if (foundSubjects.length === 0) {
                return res.status(404).json({ message: "No has registrado calificaciones del primer parcial" });
            }
            console.log("Calificaciones del primer parcial encontradas:", foundSubjects);
            
            // CALIFICACIÓN DEL PARCIAL 1
            const cal1 = foundSubjects[0].subject;
            console.log("Calificación del primer parcial:", cal1);
            
            // SUMA DE CALIFICACIONES
            const totalCalification = (cal1 + req.body.subject) / 2;
            const status = totalCalification >= 8 ? "Aprobado" : "Reprobado";
            console.log("Calificación final:", totalCalification, "Estado:", status);
            
            // Asignar la calificación final y el estado al nuevo objeto de Subject
            newSubject.finalScore = totalCalification;
            newSubject.status = status;

            const foundUser = await User.findById(student);
            const foundGrade = await Grader.findById(grade);

                // Verificar si el correo existe
            tienecorreo=null;
                if (foundUser.email != null) {
            tienecorreo='si tiene';
                    const mailOptions = {
                        from: '2021371093@uteq.edu.mx',  // El remitente
                        to: foundUser.email,  // El destinatario
                        subject: `Calificacion final en la materia: ${foundGrade.name}`,
                        
                        html: `
                        <div style="background-color: #f0f0f0; padding: 20px; font-family: Arial, sans-serif; color: #666390;">
                        
                        <h3 style="color: #666390;">La Calificación Final obtenida en la materia <strong>${foundGrade.name}</strong>, del Grado <strong>${newSubject.grado}</strong>, por el Estudiante <strong>${foundUser.name}</strong>, fue la siguiente:</h3>
                        
                        <div style="background-color: #b199dd; padding: 15px; border-radius: 8px; margin-top: 20px;">
                            <h4 style="color: #fff; margin: 0;">Calificación del Primer Parcial: <strong>${cal1}</strong></h4>
                        </div>
                        
                        <div style="background-color: #666390; padding: 15px; border-radius: 8px; margin-top: 15px;">
                            <h4 style="color: #fff; margin: 0;">Calificación del Segundo Parcial: <strong>${newSubject.subject}</strong></h4>
                        </div>
                        
                        <div style="background-color: #ffdbf4; padding: 15px; border-radius: 8px; margin-top: 15px;">
                            <h4 style="color: #666390; margin: 0;">Calificación Final: <strong>${totalCalification}</strong></h4>
                        </div>
                        
                        <br/>
                        <p style="text-align: center; color: #666390;">Gracias por tu esfuerzo y dedicación.</p>
                        </div>`  // Opcional, si quieres enviar HTML
                       
                    };
                    
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            return console.log(error);
                        }
                        console.log('Correo enviado: ' + info.response);
                        infocorreo=info.response;
                    });

                }
        }
        
        await newSubject.save();

        
        return res.status(200).json({ message: "Calificaciones agregadas al parcial " + parcial + "." + infocorreo + " la info: " + tienecorreo});
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Error: " + e });
    }
}

//Editar calificaciones
export const editSubject = async (req, res) => {
    try {
        // Extrae los datos de la solicitud
        const { subjectId } = req.params; // ID de la asignatura a editar
        const { student, parcial, grado, grade, subject } = req.body; // Nuevos datos de la asignatura

        // Validaciones
        if (!mongoose.Types.ObjectId.isValid(subjectId)) {
            return res.status(400).json({ message: "ID de asignatura no válido." });
        }

        const existingSubject = await Subject.findById(subjectId);
        if (!existingSubject) {
            return res.status(404).json({ message: "Asignatura no encontrada." });
        }

        // Actualiza los datos de la asignatura
        existingSubject.student = [];
        existingSubject.grade = [];
        existingSubject.parcial = parcial;
        existingSubject.grado = grado;
        existingSubject.subject = subject;

        // Actualiza los estudiantes asociados a la asignatura
        if (student && student.length > 0) {
            for (const studentId of student) {
                if (!mongoose.Types.ObjectId.isValid(studentId)) {
                    return res.status(400).json({ message: "ID de estudiante no válido." });
                }
                const foundUser = await User.findById(studentId);
                if (!foundUser) {
                    return res.status(404).json({ message: "Estudiante no encontrado." });
                }
                const foundRoles = await Role.find({ _id: { $in: foundUser.roles[0] } });
                const roleName = foundRoles[0].name;
                if (roleName !== "alumno") {
                    return res.status(400).json({ message: "El usuario no es un estudiante." });
                }
                existingSubject.student.push(foundUser._id);
            }
        }

        // Actualiza las materias asociadas a la asignatura
        if (grade && grade.length > 0) {
            for (const gradeId of grade) {
                if (!mongoose.Types.ObjectId.isValid(gradeId)) {
                    return res.status(400).json({ message: "ID de materia no válido." });
                }
                const foundGrade = await Grader.findById(gradeId);
                if (!foundGrade) {
                    return res.status(404).json({ message: "Materia no encontrada." });
                }
                existingSubject.grade.push(foundGrade._id);
            }
        }

        //ACTUALIZAR CALIFICACIONES TOTALES
        if (parcial === 1) {
            //TOMAMOS EL GRADO MAS RECIENTE
            const foundSubjects = await Subject.find({ grade: grade, parcial: 1, grado: grado }); // Buscar los sujetos asociados al grado
            if (foundSubjects.length === 0) {
                return res.status(404).json({ message: "No has registrado calificaciones del primer parcial" });
            }
            //CALIFICACION DEL PARCIAL 1
            const cal1 = req.body.subject;
            //VERIFICAR SI HAY CALIFICACIONES DEL SEGUNDO PARCIAL
            const foundSubjects2 = await Subject.find({ grade: grade, parcial: 2, grado: grado }); // Buscar los sujetos asociados al grado
            if (foundSubjects2.length !== 0) {
                console.log(foundSubjects2)
                //CALIFICACION DEL PARCIAL 2
                const cal2 = foundSubjects2[0].subject;
                //SUMA DE CALIFICACIONES
                const totalCalification = (cal1 + cal2) / 2;
                const status = totalCalification >= 8 ? "Aprobado" : "Reprobado";
                //ACTUALIZAR LA CALIFICACION FINAL DEL SEGUNDO PARCIAL
                await Subject.updateOne({ _id: foundSubjects2[0]._id }, { $set: { finalScore: totalCalification, status: status } });
            }
        }
        if (parcial === 2) {
            //TOMAMOS EL GRADO MAS RECIENTE
            const foundSubjects = await Subject.find({ grade: grade, parcial: 1, grado: grado }); // Buscar los sujetos asociados al grado
            if (foundSubjects.length === 0) {
                return res.status(404).json({ message: "No has registrado calificaciones del primer parcial" });
            } else {
                //CALIFICACION DEL PARCIAL 1
                const cal1 = foundSubjects[0].subject;
                //SUMA DE CALIFICACIONES
                const totalCalification = (cal1 + req.body.subject) / 2;
                const status = totalCalification >= 8 ? "Aprobado" : "Reprobado";
                // Asignar la calificación final y el estado al nuevo objeto de Subject
                existingSubject.finalScore = totalCalification;
                existingSubject.status = status;
            }
        }

        // Guarda los cambios en la base de datos
        await existingSubject.save();

        // Responde al cliente
        return res.status(200).json({ message: "Asignatura actualizada correctamente." });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error: " + error });
    }
};

//Eliminar calificaciones
export const deleteSubject = async (req, res) => {
    try {
        const { subjectId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(subjectId)) {
            return res.status(400).json({ message: "ID de asignatura no válido." });
        }
        const subject = await Subject.findOneAndDelete({ _id: subjectId });
        if (!subject) {
            return res.status(404).json({ message: "Asignatura no encontrada." });
        }
        return res.status(200).json({ message: "Asignatura eliminada correctamente." });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error: " + error });
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

async function studentSubjects(userId) {
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
        {
            $match: {
                "student._id": new mongoose.Types.ObjectId(userId),
            },
        },
    ]);

    if (!subjects || subjects.length === 0) {
        return "No hay calificaciones";
    }
    return subjects;
}
