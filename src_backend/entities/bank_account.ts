//Định nghĩa shema và truy vấn đến database
import { model, Document, Schema } from 'mongoose'

const bankAccountSchema = new Schema({
    bank_name: {
        type: String,
        require: true
    },
    account_number: {
        type: String,
        require: true
    },
    account_username: {
        type: String,
        require: true
    },
    bank_account_fullname: {
        type: String,
        require: true
    },
    id_number: {
        type: String,
        require: true
    },
    id_card_date: {
        type: Number,
        require: true
    },
    issued_location: {
        type: String,
        require: true
    },
    front_side_image_id: {
        type: String,
        default: null
    },
    back_side_image_id: {
        type: String,
        default: null
    },
})

export class BankAccount {
    _id: string
    bank_name: string;
    account_number: string;
    account_username: string;
    bank_account_fullname: string;
    id_number: string;
    id_card_date: number;
    issued_location: string;
    front_side_image_id: string;
    back_side_image_id: string;

    constructor(dto: any){
        this._id = dto._id
        this.bank_name = dto.bank_name
        this.account_number = dto.account_number
        this.account_username = dto.account_username
        this.bank_account_fullname = dto.bank_account_fullname
        this.id_number = dto.id_number
        this.id_card_date = dto.id_card_date
        this.issued_location = dto.issued_location
        this.front_side_image_id = dto.front_side_image_id
        this.back_side_image_id = dto.back_side_image_id
    }
}

export const BankAccountModel = model('bank_account', bankAccountSchema)