//Định nghĩa shema và truy vấn đến database
import { model, Document, Schema } from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

const savePostSchema = new Schema({
    user_id: {
        type: String,
        require: true
    },
    post_id: {
        type: String,
        require: true
    },
    time_save: {
        type: Number,
        require: true
    }


})
savePostSchema.plugin(mongoosePaginate)

export class SavePost {
    _id: string;
    user_id: string;
    post_id: string;
    time_save: number;
}

export const SavePostModel  = model('save_post', savePostSchema)