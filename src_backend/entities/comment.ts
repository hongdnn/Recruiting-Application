//Định nghĩa shema và truy vấn đến database
import { model, Document, Schema } from 'mongoose'

const commentSchema = new Schema({
    content: {
        type: String,
        require: true
    },
    parent_comment_id: {
        type: String,
        default: null
    },
    post_id: {
        type: String,
        require: true
    },
    user_id: {
        type: String,
        require: true
    },
    time:{
        type: Number,
        require: true
    },
    is_disable: {
        type: Boolean,
        require: true
    }, 
    like_action: {
        type: Array,
        default: []
    }

})

export class Comment {
    _id: string;
    content: string;
    parent_comment_id: string;
    post_id: string;
    user_id: string;
    time: number;
    is_disable: boolean;
    like_action: Array<string>;
}

export const CommentModel  = model('comment', commentSchema)