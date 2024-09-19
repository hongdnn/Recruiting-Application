//Định nghĩa shema và truy vấn đến database
import { model, Document, Schema } from 'mongoose'

const jobSchema = new Schema({
    industry_id: {
        type: String,
        require: true
    },
    function_id: {
        type: String,
        require: true
    },
    name: {
        type: String,
        require: true
    },
    keyword: {
        type: Object,
        require: true
    },
    status: {
        type: String,
        require: true
    },
    translate: {
        type: Object,
        require: true
    },
    description: {
        type: String,
        require: true
    }
})

export class Job {
    _id: string;
    industry_id: string;
    function_id: string;
    name: string;
    keyword: object;
    status: string;
    translate: object;
    description: string;
}

export class JobReturnDto{
    id: string;
    name: string;
    translate: object;
}

export const JobModel = model('job', jobSchema)