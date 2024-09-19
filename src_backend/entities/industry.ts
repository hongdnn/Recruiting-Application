//Định nghĩa shema và truy vấn đến database
import { model, Document, Schema } from 'mongoose'

const industrySchema = new Schema({
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

export class Industry {
    _id: string;
    name: string;
    keyword: object;
    status: string;
    translate: object;
    description: string;
}

export class IndustryReturnDto{
    id: string;
    name: string;
    translate: object;
}

export const IndustryModel = model('industry', industrySchema)