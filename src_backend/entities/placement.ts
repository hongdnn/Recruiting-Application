//Định nghĩa shema và truy vấn đến database
import { model, Document, Schema } from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

const placementSchema = new Schema({
    candidate_introduction_id: {
        type: String,
        require: true
    },
    reward_amount: {
        type: Array,
        require: true
    },
    payment_status:{
        type: Array,
        require: true,
        default: []
    },
    created_date: {
        type: Number,
        require: true
    },
    placement_date: {
        type: Array,
        require: true,
        default: []
    },
    bonus: {
        type: Number,
        default: null
    },
    currency: {
        type: String,
        require: true
    },
    created_by:{
        type: String,
        require: true
    }
})

placementSchema.plugin(mongoosePaginate)
export class Placement {
    _id: string;
    candidate_introduction_id: string;
    reward_amount: Array<number>;
    payment_status: Array<string>;
    created_date: number;
    placement_date: Array<number>;
    bonus: number;
    currency: string;
    created_by: string;
   
}

export const PlacementModel  = model('placement', placementSchema)