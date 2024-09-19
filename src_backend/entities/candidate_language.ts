//Định nghĩa shema và truy vấn đến database
import { model, Document, Schema } from 'mongoose'

const candidateLanguageSchema = new Schema({
    candidate_id: {
        type: String,
        require: true
    },
    language_id: {
        type: String,
        require: true
    },
    year_of_experience: {
        type: Number,
        require: true
    },
    your_rating:{
        type: String,
        require: true
    }


})

export class CandidateLanguage {
    _id: string;
    candidate_id: string;
    language_id: string;
    year_of_experience: number;
    your_rating: number;
}

export const CandidateLanguageModel  = model('candidate_language', candidateLanguageSchema)