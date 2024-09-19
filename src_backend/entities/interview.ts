//Định nghĩa shema và truy vấn đến database
import { model, Document, Schema } from 'mongoose'

const interviewSchema = new Schema({
    type: {
        type: String,
        require: true
    },
    stage:{
        type: Number,
        require: true
    },
    stage_description: {
        type: String,
        require: true

    },

})

export class Interview {
    _id: string
    type: string;
    stage: number;
    stage_description: number;

    constructor(dto){
        this.type = dto.type
        this.stage = dto.stage
        this.stage_description = dto.stage_description
    }
}

export const InterviewModel  = model('interview', interviewSchema)