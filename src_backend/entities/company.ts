//Định nghĩa shema và truy vấn đến database
import { model, Document, Schema } from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
const companySchema = new Schema({
    industry_id: {
        type: String,
        require: true
    },
    function_id: {
        type: String,
        default: null
    },
    job_id: {
        type: String,
        default: null
    },
    country_id: {
        type: String,
        default: null
    },
    city_id: {
        type: String,
        default: null
    },
    contact_name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    phone: {
        type: String,
        require: true
    },
    company: {
        type: String,
        require: true
    },
    status: {
        type: String,
        require: true
    },
    createdDate: {
        type: Number,
        require: true
    },
    website: {
        type: String,
        default: null
    },
    introduction: {
        type: String,
        default: null
    },
    image_file_id: {
        type: String,
        require: true
    },
    address: {
        type: String,
        default: null
    }
})

companySchema.plugin(mongoosePaginate)
export class Company {
    _id: string;
    industry_id: string;
    function_id: string;
    job_id: string;
    country_id: string;
    city_id: string;
    contact_name: string;
    email: string;
    phone: string;
    company: string;
    status: string;
    createdDate: Number;
    website: string;
    introduction: string;
    image_new_path?: string;
    image_file_id?: string;
    address: string;
}

export class ReturnDtoCompany{
    id: string;
    name: string;
    contact_name: string;
    phone: string;
    email: string;
}

export const CompanyModel = model('company', companySchema)
