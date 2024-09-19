//Định nghĩa shema và truy vấn đến database
import { model, Document, Schema } from 'mongoose'

const optionalFieldsValueSchema = new Schema({
    candidate_introduction_id: {
        type: String,
        require: true
    },
    optional_field_id: {
        type: String,
        require: true
    },
    value: {
        type: String,
        require: true
    }


})

export class OptionalFieldsValue {
    _id: string;
    candidate_introduction_id: string;
    optional_field_id: string;
    value: string;
}

export const OptionalFieldsValueModel  = model('optional_fields_value', optionalFieldsValueSchema)