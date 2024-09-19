//Định nghĩa shema và truy vấn đến database
import { model, Document, Schema } from 'mongoose'

const interviewScheduleStatusHistorySchema = new Schema({
    interview_schedule_id: {
        type: String,
        require: true
    },
    status: {
        type: String,
        require: true
    },
    time: {
        type: Number,
        require: true
    },
    reason: {
        type: String,
        default: null
    },
    is_disable: {
        type: Boolean,
        default: false
    }
})

export class InterviewScheduleStatusHistory {
    _id: string;
    interview_schedule_id: string;
    status: string;
    time: number;
    reason: string;
    is_disable: boolean;

}

export const InterviewScheduleStatusHistoryModel  = model('interview_schedule_status_history', interviewScheduleStatusHistorySchema)