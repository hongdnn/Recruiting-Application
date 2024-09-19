//Định nghĩa shema và truy vấn đến database
import { model, Document, Schema } from 'mongoose'

const optionalFieldSchema = new Schema({
    title: {
        type: String,
        require: true
    },
    hint: {
        type: String,
        default: null
    },
    type: {
        type: String,
        require: true
    },
    max_value:{
        type: Number,
        default: 0
    },
    min_value:{
        type: Number,
        default: 0
    },
    data:{
        type: String,
        default: null
    }



})

export class OptionalField {
    _id: string;
    title: string;
    hint: string;
    type: string;
    max_value: number;
    min_value:number;
    data:string;

    constructor(dto){
        this.title = dto.title,
        this.hint = dto.hint,
        this.type = dto.type,
        this.max_value = dto.max_value,
        this.min_value = dto.min_value,
        this.data = dto.data
    }
}

export const OptionalFieldModel  = model('optional_field', optionalFieldSchema)