//Định nghĩa shema và truy vấn đến database
import { model, Document, Schema } from 'mongoose'

const languageSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    is_disable: {
        type: Boolean,
        require: true
    }


})

export class Language {
   _id: string;
   name: string;
   is_disable: boolean;
}

export class ReturnLanguageDto{
    _id: string;
    name: string;
}

export const LanguageModel  = model('language', languageSchema)