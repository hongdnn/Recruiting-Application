//Định nghĩa shema và truy vấn đến database
import { model, Document, Schema } from 'mongoose'
import mongoosePaginate from'mongoose-paginate-v2'

const interviewScheduleSchema = new Schema({
    candidate_introduction_id: {
        type: String,
        require: true
    },
    supervisor_id: {
        type: String,
        default: null
    },
    interview_start_date:{
        type: Number,
        default: 0
    },
    interview_end_date:{
        type: Number,
        default: 0
    },
    note:{
        type: String,
        default: null
    },
    location:{
        type: String,
        default: null
    },
    interview_id: {
        type: String,
        require: true
    },
    email: {
        type: Array,
        default: []
    },
    question_ids: {
        type: Array,
        default: []
    }
})

interviewScheduleSchema.plugin(mongoosePaginate)

export class InterviewSchedule {
    _id: string;
    candidate_introduction_id: string;
    supervisor_id: string;
    interview_start_date: number;
    interview_end_date: number;
    note: string;
    location: string;
    interview_id: string;
    email: Array<string>;
    question_ids: Array<string>;
}


export const InterviewScheduleModel  = model('interview_schedule', interviewScheduleSchema)