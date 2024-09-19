//Định nghĩa shema và truy vấn đến database
import { model, Document, Schema } from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

const candidateIntroductionSchema = new Schema({
    candidate_id: {
        type: String,
        require: true
    },
    post_id: {
        type: String,
        require: true
    },
    introduction_date: {
        type: Number,
        require: true
    },
    onboard_date: {
        type: Number,
        default: null
    },
    work_end_date: {
        type: Number,
        default: null
    }
    

})

candidateIntroductionSchema.plugin(mongoosePaginate)
export class CandidateIntroduction {
    _id: string;
    candidate_id: string;
    post_id: string;
    introduction_date: number;
    onboard_date: number;
    work_end_date: number;
}
export class CandidateIntroductionToExcel {
    candidate_introduction_id: string;
    candidate_name: string;
    phone: string;
    cv?: {};
    post_title: string;
    status: string;
    company: string;
    link_cv: string;
    introduction_date: string
}

export const CandidateIntroductionModel = model('candidate_introduction', candidateIntroductionSchema)