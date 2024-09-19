import { model, Document, Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2'

export class User {
    _id: string
    email: string
    password: string
    type_account: string
    first_name: string
    last_name: string
    verification_code: string
    birth_day: string
    gender: string
    address: string
    status: string
    phone: string
    image_id: string
    additional_information: string
    job_role_ids: Array<string>
    job_levels: string
    job_industries_ids: Array<string>
    candidate_skill_ids: Array<string>
    proficient_language_ids: Array<string>
    locations_ids: Array<string>
    facebook: string
    google: string
    linkedin: string
    skype: string 
    bank_id: string
    fcm_token: string
    create_at: number
    permission_ids: Array<string>

    constructor(dto: any){
        this._id = dto._id
        this.email = dto.email
        this.password = dto.password
        this.type_account = dto.type_account
        this.first_name = dto.first_name
        this.last_name = dto.last_name
        this.verification_code = dto.verification_code
        this.birth_day = dto.birth_day
        this.gender = dto.gender
        this.address = dto.address
        this.status = dto.status
        this.phone = dto.phone
        this.image_id = dto.image_id
        this.additional_information = dto.additional_information
        this.job_role_ids = dto.job_role_ids
        this.job_levels = dto.job_levels
        this.job_industries_ids = dto.job_industries_ids
        this.candidate_skill_ids = dto.candidate_skill_ids
        this.proficient_language_ids = dto.proficient_language_ids
        this.locations_ids = dto.locations_ids
        this.facebook = dto.facebook
        this.google = dto.google
        this.linkedin = dto.linkedin
        this.skype = dto.skype
        this.bank_id = dto.bank_id
        this.fcm_token = dto.fcm_token
        this.permission_ids = dto.permission_ids
    }
}

export class Staff {
    _id: string
    email: string
    type_account: string
    first_name: string
    last_name: string
    birth_day: string
    gender: string
    address: string
    status: string
    phone: string
    image_id: string
    additional_information: string
    create_at: number
    permission_ids: Array<string>

    constructor(dto){
        this._id = dto._id
        this.email = dto.email
        this.type_account = dto.type_account
        this.first_name = dto.first_name
        this.last_name = dto.last_name
        this.birth_day = dto.birth_day
        this.gender = dto.gender
        this.address = dto.address
        this.status = dto.status
        this.phone = dto.phone
        this.image_id = dto.image_id
        this.additional_information = dto.additional_information
        this.permission_ids = dto.permission_ids
    }
}

const userSchema = new Schema({

    email: {
        type: String,
        default: null
    },
    password: {
        type: String,
        default: null
    },
    type_account: {
        type: String,
        require: true
    },
    first_name: {
        type: String,
        require: true
    },
    last_name: {
        type: String,
        required: true
    },
    verification_code: {
        type: String,
        default: null
    },
    address: {
        type: String,
        default: null
    },
    birth_day: {
        type: String,
        default: null
    },
    gender: {
        type: String,
        default: null
    },
    status: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        default: null
    },
    image_id: {
        type: String,
        default: null
    },
    additional_information: {
        type: String,
        default: null

    },
    job_role_ids: {
        type: Array,
        validate: [arrayLimit(5), 'The limit of 5'],
        default: []
    },
    job_levels: {
        type: String,
        default: null
    },
    job_industries_ids: {
        type: Array,
        validate: [arrayLimit(3), 'The limit of 3'],
        default: []

    },
    candidate_skill_ids: {
        type: Array,
        validate: [arrayLimit(10), 'The limit of 10'],
        default: []
    },
    proficient_language_ids: {
        type: Array,
        validate: [arrayLimit(3), 'The limit of 3'],
        default: []

    },
    locations_ids: {
        type: Array,
        validate: [arrayLimit(3), 'The limit of 3'],
        default: []
    },
    facebook: {
        type: String,
        default: null
    },
    google: {
        type: String,
        default: null
    },
    linkedin: {
        type: String,
        default: null
    },
    skype: {
        type: String,
        default: null
    },
    bank_id: {
        type: String,
        default: null
    },
    fcm_token: {
        type: String,
        default: null
    },
    permission_ids: {
        type: Array,
        default: []
    },
    create_at: {
        type: Number,
        default: 0
    }
})

function arrayLimit(limit) {
    return function (val) {
        return val.length <= limit
    }
}

userSchema.plugin(mongoosePaginate)

export const UserModel = model('user', userSchema)
