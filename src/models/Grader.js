import {model, Schema} from "mongoose";

const userSchema = new Schema({
        name: {
            type: String,
            required: true
        },
        professor: [{
            ref: "User",
            type: Schema.Types.ObjectId
        }],
        career: [{
            ref: "Career",
            type: Schema.Types.ObjectId
        }]
    },
    {
        timestamps: true,
        versionKey: false
    })

export default model('Grader', userSchema)