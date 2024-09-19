//Định nghĩa shema và truy vấn đến database
import mongoose from 'mongoose'
import { CandidateLanguage } from './candidate_language';
import { CandidateSkill } from './candidate_skill';
import { WorkExperience } from './work_experience';
import mongoosePaginate from 'mongoose-paginate-v2'

const candidateSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    phone: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    cv_id: {
        type: String,
        require: true
    },
    salary_from: {
        type: Number,
        default: 0
    },
    salary_to: {
        type: Number,
        default: 0
    },
    currency: {
        type: String,
        require: true
    },
    negotiable: {
        type: Boolean,
        require: true
    },
    city_ids: {
        type: Array,
        require: true
    },
    profile_title: {
        type: String,
        require: true
    },
    candidate_availability: {
        type: String,
        require: true
    },
    current_salary: {
        type: Number,
        default: 0
    },
    suitable_reason: {
        type: String,
        default: ""
    },
    candidate_expectation: {
        type: String,
        require: true
    },
    job_role_ids: {
        type: Array,
        default: []
    },
    job_levels: {
        type: String,
        default: null
    },
    candidate_skills_ids: {
        type: Array,
        default: []
    },
    candidate_languages_ids: {
        type: Array,
        default: []
    },
    work_experiences_ids: {
        type: Array,
        default: []
    },
    date_created: {
        type: Number,
        require: true
    },
    is_disable: {
        type: Boolean,
        require: true
    },
    status: {
        type: String,
        require: true
    },
    content_cv: {
        type: String,
        require: true
    }, 
    collaborator_id: {
        type: String,
        require: true
    },
    content_cv_clean:{
        type: String,
        require: true
    },
    
})

candidateSchema.plugin(mongoosePaginate)

export class Candidate {
    _id: string;
    name: string;
    phone: string;
    email: string;
    cv_id: string;
    salary_from: number;
    salary_to: number;
    currency: string;
    negotiable: boolean;
    city_ids: Array<string>;
    profile_title: string;
    candidate_availability: string;
    current_salary: Number;
    suitable_reason: string;
    candidate_expectation: string;
    job_role_ids: Array<string>;
    job_levels: string;
    candidate_skills_ids: Array<string>;
    candidate_languages_ids: Array<string>;
    work_experiences_ids:  Array<string>;
    date_created: number;
    is_disable: boolean;
    status: string;
    content_cv: string;
    collaborator_id: string;
    content_cv_clean: string;
}

export class RequestCreateCandidate{
    name: string;
    phone: string;
    email: string;
    salary_from: number;
    salary_to: number;
    negotiable: boolean;
    currency: string;
    city_ids: Array<string>;
    profile_title: string;
    candidate_availability: string;
    current_salary: Number;
    suitable_reason: string;
    candidate_expectation: string;
    job_role_ids: Array<string>;
    job_levels: Array<string>;
    candidate_skills: Array<CandidateSkill>
    candidate_languages: Array<CandidateLanguage>;
    work_experiences:  Array<WorkExperience>;
    path_cv_hided: string;
}

export class RequestUpdateCandidate{
    id: string;
    name: string;
    phone: string;
    email: string;
    salary_from: number;
    salary_to: number;
    negotiable: boolean;
    currency: string;
    city_ids: Array<string>;
    profile_title: string;
    candidate_availability: string;
    current_salary: Number;
    suitable_reason: string;
    candidate_expectation: string;
    job_role_ids: Array<string>;
    job_level_array: Array<string>;
    job_levels : string;
    candidate_skills: Array<CandidateSkill>
    candidate_languages: Array<CandidateLanguage>;
    work_experiences:  Array<WorkExperience>;
}

export class RequestSelfAppliedCandidate{
    name: string;
    phone: string;
    email: string;
    salary_from: number;
    salary_to: number;
    negotiable: boolean;
    current_salary: number;
    currency: string;
    city_ids: Array<string>;
    profile_title: string;
    candidate_availability: string;
    suitable_reason: string;
    candidate_expectation: string;
    collaborator_id: string;
    job_role_ids: Array<string>;
    job_levels: Array<string>;
    path_cv_hided: string;
    optionalFieldsValue: Array<{optionalFieldId: string, value: string}>
    post_id: string;
    candidate_skills: Array<CandidateSkill>
    candidate_languages: Array<CandidateLanguage>;
    work_experiences:  Array<WorkExperience>;
    
    
}

export const CandidateModel = mongoose.model('candidate', candidateSchema)

