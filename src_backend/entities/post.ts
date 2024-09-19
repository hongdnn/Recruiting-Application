//Định nghĩa shema và truy vấn đến database
import { model, Document, Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2'
const postSchema = new Schema({
    industry_id: {
        type: String,
        required: true
    },
    function_id: {
        type: String,
        required: true
    },
    job_id: {
        type: String,
        require: true
    },
    title: {
        type: String,
        require: true
    },
    city_ids: {
        type: Array,
        require: true
    },
    user_id: {
        type: String,
        require: true
    },
    country_id: {
        type: String,
        require: true
    },
    date_on: {
        type: Number,
        default: 0
    },
    date_off: {
        type: Number,
        require: true
    },
    date_end: {
        type: Number,
        require: true
    },
    full_name: {
        type: String,
        require: true
    },
    job_level: {
        type: String,
        require: true
    },
    job_role_ids:{
        type: Array,
        require: true
    },
    email: {
        type: String,
        default: null
    },
    phone: {
        type: String,
        default: null
    },
    content: {
        type: String,
        default: null
    },
    require: {
        type: String,
        default: null
    },
    benefit: {
        type: String,
        default: null
    },
    salary_from: {
        type: Number,
        default: 0
    },
    salary_to: {
        type: Number,
        default: 0
    },
    negotiable: {
        type: Boolean,
        default: false
    },
    type_work: {
        type: String,
        default: "Fulltime"
    },
    skill_ids: {
        type: Array,
        require: true
    },
    language_ids: {
        type: Array,
        require: true
    },
    education_level: {
        type: String,
        default: null
    },
    views: {
        type: Number,
        default: 0
    },
    company_id: {
        type: String,
        default: null
    },
    address: {
        type: String,
        default: null
    },
    require_number: {
        type: Number,
        require: true
    },
    urgency: {
        type: Boolean,
        default: false
    },
    security: {
        type: Boolean,
        default: false
    },
    question_packages:{
        type: Array,
        require: true
    },
    optional_field_ids:{
        type: Array,
        require: true
    },
    interview_ids:{
        type: Array,
        require: true
    },
    update_time: {
        type: Number,
        default: 0
    },
    keywords: {
        type: Array
    },
    status: {
        type: String,
        default: "pause"
    },
    commission:{
        type: Number,
        default: 0
    },
    currency:{
        type: String,
        require: true
    },
    guarantee:{
        type: Number,
        default: 0
    },
    guarantee_type:{
        type: String,
        require: true
    },
    guarantee_date:{
        type: Number,
        default: 0
    },
    bonus:{
        type: Number,
        default: 0
    },
    bonus_start_date:{
        type: Number,
        default: 0
    },
    bonus_end_date:{
        type: Number,
        default: 0
    },
    notice_for_referrer: {
        type: String,
        default: null
    }
})

postSchema.plugin(mongoosePaginate)

export class Post {
    _id: string
    industry_id: string
    function_id: string
    job_id: string
    title: string
    city_ids: Array<string>
    user_id: string
    country_id: string
    date_on: number
    date_off: number
    date_end: number
    full_name: string
    job_level: string
    job_role_ids: Array<string>
    email: string
    phone: string
    content: string
    require: string
    benefit: string
    salary_from: number
    salary_to: number
    negotiable: boolean
    type_work: string
    skill_ids: Array<string>
    language_ids: Array<string>
    education_level: string
    views: number
    optional_field_ids: Array<string>
    company_id: string
    address: string
    require_number: number
    urgency: boolean
    security: boolean
    question_packages: Array<string>
    interview_ids: Array<string>
    update_time: number
    keywords: Array<string>
    status: string
    commission: number
    currency: string
    notice_for_referrer: string
    guarantee: number
    guarantee_date : number
    guarantee_type: string
    bonus : number
    bonus_start_date : number
    bonus_end_date : number

    constructor(dto: any) {
        this.industry_id = dto.industry_id
        this.function_id = dto.function_id
        this.job_id = dto.job_id
        this.title = dto.title
        this.city_ids = dto.city_ids
        this.user_id = dto.user_id
        this.country_id = dto.country_id
        this.date_on = dto.date_on
        this.date_off = dto.date_off
        this.date_end = dto.date_end
        this.full_name = dto.full_name
        this.job_level = dto.job_level
        this.job_role_ids = dto.job_role_ids
        this.email = dto.email
        this.phone = dto.phone
        this.content = dto.content
        this.require = dto.require
        this.benefit = dto.benefit
        this.salary_from = dto.salary_from
        this.salary_to = dto.salary_to
        this.negotiable = dto.negotiable
        this.type_work = dto.type_work
        this.skill_ids = dto.skill_ids
        this.language_ids = dto.language_ids
        this.education_level = dto.education_level
        this.views = dto.views
        this.company_id = dto.company_id
        this.address = dto.address
        this.require_number = dto.require_number
        this.urgency = dto.urgency
        this.security = dto.security
        this.question_packages = dto.question_packages
        this.interview_ids = dto.interview_ids
        this.commission = dto.commission
        this.currency = dto.currency
        this.update_time = dto.update_time
        this.keywords = dto.keywords
        this.optional_field_ids = dto.optional_field_ids
        this.status = dto.status
        this.notice_for_referrer = dto.notice_for_referrer
        this.guarantee = dto.guarantee
        this.guarantee_type = dto.guarantee_type
        this.guarantee_date = dto.guarantee_date
        this.bonus = dto.bonus
        this.bonus_start_date = dto.bonus_start_date
        this.bonus_end_date = dto.bonus_end_date
    }
}

export const PostModel = model('post', postSchema)
// const Post = moongose.model('Post', postSchema)
// module.exports = Post