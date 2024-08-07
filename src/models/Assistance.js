import {model, Schema} from "mongoose";

const assistanceSchema = new Schema({
        student: {
            required: true,
            ref: "User",
            type: Schema.Types.ObjectId
        },
        mateer: {
            required: true,
            ref: "Carrer",
            type: Schema.Types.ObjectId
        },
        professor: {
            required: true,
            ref: "User",
            type: Schema.Types.ObjectId
        },
        dia: 
        {
            required: true,
            type: Schema.Types.Date
        },
    },
    {
        timestamps: true,
        versionKey: false
    })

export default model('Assistance', assistanceSchema)