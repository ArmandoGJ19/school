//Importar modelo de datos Role
import Role from "../models/Role.js";

//Exportar funcion para crear roles
export const createRoles = async () => {
    try {
        //Verificar si existen roles en la base de datos
        const count = await Role.estimatedDocumentCount();
        //Si no existen roles, crearlos
        if (count > 0) return;
        //Crear roles por defecto en la base de datos
        const values = await Promise.all([
            new Role({ name:"alumno" }).save(),
            new Role({ name:"profesor" }).save(),
            new Role({ name:"servicios_escolares" }).save(),
        ]);
        // console.log(values);
    } catch (error) {
        console.error(error);
    }
}