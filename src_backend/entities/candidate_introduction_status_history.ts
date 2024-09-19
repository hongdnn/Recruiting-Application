//Định nghĩa shema và truy vấn đến database
import { model, Document, Schema } from 'mongoose'

const candidateIntroductionStatusHistorySchema = new Schema({
    candidate_introduction_id: {
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
    note: {
        type: String,
        default: null
    },
    is_disable: {
        type: Boolean,
        default: false,
        require: true
    }


})

export class CandidateIntroductionStatusHistory {
    _id: string;
    candidate_introduction_id: string;
    status: string;
    time: number;
    note: string;
    is_disable: boolean;
}

export const CandidateIntroductionStatusHistoryModel  = model('candidate_introduction_status_history', candidateIntroductionStatusHistorySchema)