//Định nghĩa shema và truy vấn đến database
import { model, Document, Schema } from 'mongoose'

const permissionSchema = new Schema({
    permission: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    page: {
        type: String,
        require: true
    },
    is_disable: {
        type: Boolean,
        require: true
    }
})

export class Permission {
    _id: string
    permission: string;
    description: string;
    page: string;
    is_disable: boolean;
}


export const PermissionModel = model('permission', permissionSchema)