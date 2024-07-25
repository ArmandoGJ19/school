import {model, Schema} from "mongoose";

const userSchema = new Schema({
        name: {
            type: String,
            required: true
        },
    },
    {
        timestamps: true,
        versionKey: false
    })

export default model('Carrer', userSchema)