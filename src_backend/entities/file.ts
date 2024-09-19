//Định nghĩa shema và truy vấn đến database
import { model, Document, Schema } from 'mongoose'

const fileSchema = new Schema({
    type: {
        type: String,
        require: true
    },
    name: {
        type: String,
        require: true
    },
    extension: {
        type: String,
        require: true
    },
    path: {
        type: String,
        require: true
    },
    width: {
        type: String,
        default: ""
    },
    height: {
        type: String,
        default: ""
    },
    admin_id: {
        type: String,
        default: null
    },
    user_id: {
        type: String,
        require: true
    }
}, { timestamps: true })

export class File {
    _id: string;
    type: string;
    name: string;
    extension: string;
    path: string;
    width: string;
    height: string;
    admin_id: string;
    user_id: string;
}

export const FileModel = model('file', fileSchema)