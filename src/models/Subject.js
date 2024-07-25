import { Schema, model } from 'mongoose';

const subjectSchema = new Schema({
    student: [{
        ref: "User",
        type: Schema.Types.ObjectId
    }],
    grade: [{
        ref: "Grader",
        type: Schema.Types.ObjectId
    }],
    parcial: {
        type: Number,
        required: true,
    },
    grado: {
        type: Number,
        required: true,
    },
    subject: {
        type: Number,
        required: true,
        decimal: true,
    },
    finalScore: {
        type: Number,
        decimal: true,
    },
    status: {
        type: String,
        enum: ["Aprobado", "Reprobado"]
    }
},
    {
        timestamps: true,
        versionKey: false
    })

export default model('Subject', subjectSchema)