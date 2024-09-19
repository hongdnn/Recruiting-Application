//Định nghĩa shema và truy vấn đến database
import { model, Document, Schema } from 'mongoose'

const workExperienceSchema = new Schema({
    industry_ids: {
        type: Array,
        require: true,
        default: []
    },
    job_role_ids: {
        type: Array,
        require: true,
        default: []
    },
    job_title: {
        type: String,
        require: true
    },
    work_duration: {
        type: String,
        require: true
    },
    candidate_id:{
        type: String,
        require: true
    }


})

export class WorkExperience {
    _id: string;
    industry_ids: Array<string>;
    job_role_ids: Array<string>;
    job_title: string;
    work_duration: string;
    candidate_id: string;
}

export const WorkExperienceModel  = model('work_experience', workExperienceSchema)