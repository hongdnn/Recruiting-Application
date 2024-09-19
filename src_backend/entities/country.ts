//Định nghĩa shema và truy vấn đến database
import { model, Document, Schema } from 'mongoose'

const countrySchema = new Schema({
    title: {
        type: String,
        require: true
    },
    alias: {
        type: String,
        require: true
    },
    translate: {
        type: Object,
        require: true
    },
    status: {
        type: String,
        require: true
    },
    iso_name:{
        type: String,
        require: true
    }

})

export class Country {
    _id: string;
    title: string;
    alias: string;
    status: string;
    translate: object;
    iso_name: string;
}

export const CountryModel = model('country', countrySchema)