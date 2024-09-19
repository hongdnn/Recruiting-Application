//Định nghĩa shema và truy vấn đến database
import { model, Document, Schema } from 'mongoose'

const interviewScheduleQuestionSchema = new Schema({
    question_content: {
        type: String,
        require: true
    },
    answer_point: {
        type: Number,
        default: 0
    }
})

export class InterviewScheduleQuestion {
    _id: string;
    question_content: string;
    answer_point: number;

    constructor(dto){
        this.question_content = dto.question_content
        this.answer_point = dto.answer_point
    }
}


export const InterviewScheduleQuestionModel  = model('interview_schedule_question', interviewScheduleQuestionSchema)