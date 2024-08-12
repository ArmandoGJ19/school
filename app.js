import express from "express";
import cors from "cors";
import userRoutes from "./src/routes/user.routes.js";
import careerRoutes from "./src/routes/career.routes.js";
import graderRoutes from "./src/routes/grader.routes.js";
import subjectRoutes from "./src/routes/subject.routes.js";
import graphics from "./src/routes/graphics.routes.js";
import authRoutes from "./src/routes/auth.routes.js";
import assistanceRoutes from "./src/routes/assistance.routes.js"
import {createRoles} from "./src/libs/initialSetup.js";

const app = express();

// Configuración de CORS
const corsOptions = {
    origin: '*', // Permite todas las orígenes
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['X-Requested-With', 'Content-Type', 'Authorization', 'x-access-token']
};

app.use(cors(corsOptions));

//Ejecutar la función para crear roles por defecto
createRoles();
//sirve para que express entienda formato JSON y pueda manejar peticiones POST
app.use(express.json());

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

//RUTAS PARA LOS MODULOS DEL SISTEMA
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/careers', careerRoutes);
app.use('/api/grades', graderRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/assistances', assistanceRoutes);
app.use('/api/graphics', graphics);
export default app;
