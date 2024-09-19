//Định nghĩa shema và truy vấn đến database
import { model, Document, Schema } from 'mongoose'

const skillSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    alias: {
        type: String,
        require: true
    },
    parent: {
        type: String,
        require: true
    },
    translate: {
        type: Object,
        require: true
    },
    keyword:{
        type: Object,
        require: true
    }

})

export class Skill {
    _id: string;
    name: string;
    parent: string;
    translate: object;
    alias: string;
    keyword: object;
}

export class ReturnSkillDto {
    _id: string
    name: string;
}

export const SkillModel = model('skill', skillSchema)