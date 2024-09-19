//Định nghĩa shema và truy vấn đến database
import { model, Document, Schema } from 'mongoose'

const candidateSkillSchema = new Schema({
    candidate_id: {
        type: String,
        require: true
    },
    skill_id: {
        type: String,
        require: true
    },
    year_of_experience: {
        type: Number,
        require: true
    },
    rating: {
        type: String,
        require: true
    }

})

export class CandidateSkill {
    _id: string;
    candidate_id: string;
    skill_id: string;
    year_of_experience: number;
    rating: string;
}

export const CandidateSkillModel = model('candidate_skill', candidateSkillSchema)