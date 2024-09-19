//Định nghĩa shema và truy vấn đến database
import { model, Document, Schema } from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

const notificationSchema = new Schema({
    title: {
        type: String,
        require: true
    },
    content: {
        type: String,
        require: true
    },
    type: {
        type: String,
        require: true
    },
    receiver_id: {
        type: String,
        require: true
    },
    time: {
        type: Number,
        require: true
    },
    is_read: {
        type: Boolean,
        default: false
    },
    link: {
        type: String,
        default: null
    },
    image: {
        type: String,
        default: null
    }
})

notificationSchema.plugin(mongoosePaginate)
export class Notification {
    _id: string
    title: string;
    content: string;
    type: string;
    receiver_id: string;
    time: number;
    is_read: boolean;
    link: string;
    image: string;
}

export const NotificationModel = model('notification', notificationSchema)