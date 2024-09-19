//Định nghĩa shema và truy vấn đến database
import { model, Document, Schema } from 'mongoose'

const jobRoleSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    job_role_description: {
        type: String,
        require: true
    },
    status: {
        type: String,
        require: true
    },
    function_id: {
        type: String,
        require: true
    },


})

export class JobRole {
   _id: string;
   name: string;
   job_role_description: string;
   status: string;
   function_id: string;
}

export class ReturnJobRoleDto{
    _id: string;
    name: string;
}

export const JobRoleModel  = model('job_role', jobRoleSchema)
