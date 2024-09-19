//Định nghĩa shema và truy vấn đến database
import { model, Document, Schema } from 'mongoose'

const warrantySchema = new Schema({
    guaranteed_candidate_introuduction_id: {
        type: String,
        require: true
    },
    alternative_candidate_introuduction_id: {
        type: String,
        require: true,
        default: null
    },
    status: {
        type:String,
        require: true
    },
    number_of_warranty_days: {
        type: Number,
        require: true
    },
    warranty_start_date: {
        type: Number,
        require: true
    }
})

export class Warranty {
    _id: string;
    guaranteed_candidate_introuduction_id: string;
    alternative_candidate_introuduction_id: string;
    number_of_warranty_days: number;
    status: string;
    warranty_start_date: number;
}

export const WarrantyModel = model('warranty', warrantySchema)