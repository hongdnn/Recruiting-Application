//Định nghĩa shema và truy vấn đến database
import { model, Document, Schema } from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

const candidateIntroductionTestSchema = new Schema({
    candidate_introduction_id: {
        type: String,
        require: true
    },
    invite_test_id: {
        type: String,
        require: true
    },
    question_package_id: {
        type: String,
        require: true
    },
    report_id: {
        type: String,
        default: null
    },
    scores: {
        type: Object,
        default: null
    },
    percents: {
        type: Object,
        default: null
    },
    invite_at: {
        type: Number,
        require: true
    }
})
candidateIntroductionTestSchema.plugin(mongoosePaginate)
export class CandidateIntroductionTest {
    _id: string;
    candidate_introduction_id: string;
    invite_test_id: string;
    question_package_id: number;
    report_id: string;
    scores: object;
    percents: object;
    invite_at: number;
}

export const CandidateIntroductionTestModel  = model('candidate_introduction_test', candidateIntroductionTestSchema)