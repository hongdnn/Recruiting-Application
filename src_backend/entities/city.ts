//Định nghĩa shema và truy vấn đến database
import { ObjectId } from 'mongodb';
import { model, Document, Schema } from 'mongoose'

const citySchema = new Schema({
    title: {
        type: String,
        require: true
    },
    alias: {
        type: String,
        require: true
    },
    country_id: {
        type: String,
        require: true
    },
    status: {
        type: String,
        require: true
    },
    translate: {
        type: Object,
        require: true
    }

})

export class City {
    _id: string;
    title: string;
    alias: string;
    country_id: string;
    status: string;
    translate: object;
}

export class ReturnCityDto {
    id: string;
    name: string;
}

export const CityModel = model('city', citySchema)