import {Joi, Segments} from 'celebrate'
import { Constants } from '../../common/constants'

export const searchCandidateDto = {
    [Segments.QUERY]: Joi.object().options({ abortEarly: false }).keys({
        salary_from: Joi.number().min(0),
        salary_to: Joi.number().min(0),
        date_from: Joi.number().min(0),
        date_to: Joi.number().min(0),
        city_ids: Joi.string().required(),
        keyword_cv_require: Joi.string(),
        postId: Joi.string(),
        page_index: Joi.number().required().min(0),
        page_size: Joi.number().required().min(0),
        currency: Joi.string().required(),
        sort_by: Joi.number().required() // 0 (created date default), 1 (candidate name), 2 (Profile title), 3 phone
    })
}

export const createCandidateDto = {
    [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({
        name: Joi.string().required(),
        phone: Joi.string().required(),
        email: Joi.string().required(),
        salary_to: Joi.number().required().allow(null),
        salary_from: Joi.number().required().allow(null),
        city_ids: Joi.array().required().items(Joi.string().required().trim().regex(/^[a-f\d]{24}$/i)),
        profile_title: Joi.string().required(),
        negotiable: Joi.boolean().required(),
        current_salary: Joi.number().required().allow(null),
        currency: Joi.string().required().valid(...Constants.currency),
        candidate_availability: Joi.string().required().regex(/^[0,1,2,3]{1}$/),
        suitable_reason: Joi.string().required(),
        candidate_expectation: Joi.string().required(),
        job_role_ids: Joi.array().max(3).required().allow(null).items(Joi.string().required().trim().regex(/^[a-f\d]{24}$/i)),
        job_levels: Joi.array().max(3).items(Joi.string().required().valid(...Constants.jobLevel)).required().allow(null),
        candidate_skills: Joi.array().required().allow(null),
        candidate_languages: Joi.array().required().allow(null),
        path_cv_hided: Joi.string().required(),
        work_experiences: Joi.array().required().allow(null)
    })
}

export const selfAppliedCandidateDto = {
    [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({
        name: Joi.string().required(),
        phone: Joi.string().required(),
        email: Joi.string().required(),
        salary_to: Joi.number().required().allow(null),
        salary_from: Joi.number().required().allow(null),
        city_ids: Joi.array().required().items(Joi.string().required().trim().regex(/^[a-f\d]{24}$/i)),
        profile_title: Joi.string().required(),
        collaborator_id: Joi.string().required(),
        post_id: Joi.string().required().trim().regex(/^[a-f\d]{24}$/i),
        candidate_availability: Joi.string().required().regex(/^[0,1,2,3]{1}$/),
        suitable_reason: Joi.string().required(),
        candidate_expectation: Joi.string().required(),
        negotiable: Joi.boolean().required(),
        current_salary: Joi.number().required().allow(null),
        currency: Joi.string().required().valid(...Constants.currency),
        job_role_ids: Joi.array().max(3).required().allow(null).items(Joi.string().required().trim().regex(/^[a-f\d]{24}$/i)),
        job_levels: Joi.array().max(3).items(Joi.string().required().valid(...Constants.jobLevel)).required().allow(null),
        optionalFieldsValue: Joi.array().required().allow(null),
        candidate_skills: Joi.array().required().allow(null),
        candidate_languages: Joi.array().required().allow(null),
        work_experiences: Joi.array().required().allow(null),
        path_cv_hided: Joi.string().required()
    })
}

export const updateStatusCandidateDto = {
    [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({
        status: Joi.string().required().regex(/^[1,2]{1}$/)
    })
}

export const referCandidateDto = {
    [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({
        candidateId: Joi.string().required().regex(/^[a-f\d]{24}$/i),
        postId: Joi.string().required().regex(/^[a-f\d]{24}$/i),
        optionalFieldsValue: Joi.array().required().allow(null),
        warrantyId: Joi.string().required().allow(null).regex(/^[a-f\d]{24}$/i)
    })
}


export const updateCandidateDto = {
    [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({
        email: Joi.string().required(),
        name: Joi.string().required(),
        profile_title: Joi.string().required(),
        phone: Joi.string().required(),
        salary_from: Joi.number().required().allow(null),
        salary_to: Joi.number().required().allow(null),
        negotiable: Joi.boolean().required().allow(null),
        currency: Joi.string().required().allow(null),
        current_salary: Joi.number().required().allow(null),
        suitable_reason: Joi.string().required(),
        city_ids: Joi.array().max(3).required().items(Joi.string().required().trim().regex(/^[a-f\d]{24}$/i)),
        candidate_availability: Joi.string().required().regex(/^[0,1,2,3]{1}$/),
        candidate_expectation: Joi.string().required(),
        job_role_ids: Joi.array().max(3).allow(null).required(),
        job_level_array: Joi.array().max(3).items(Joi.string().required().valid(...Constants.jobLevel)).required().allow(null),
        candidate_skills: Joi.array().required().allow(null),
        candidate_languages: Joi.array().required().allow(null),
        work_experiences: Joi.array().required().allow(null)
    })
}

export const searchCandidateToMatchDto ={
    [Segments.QUERY]: Joi.object().options({ abortEarly: false }).keys({
        salary_from: Joi.number().min(0),
        salary_to: Joi.number().min(0),
        date_from: Joi.number().min(0),
        date_to: Joi.number().min(0),
        negotiable: Joi.boolean().required(),
        city_ids: Joi.string().required(),
        keyword_cv: Joi.string().required().allow(''),
        page_index: Joi.number().required().min(0),
        page_size: Joi.number().required().min(0),
        currency: Joi.string().trim().valid(...Constants.currency).required()
    })
}

