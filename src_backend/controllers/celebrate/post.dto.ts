import { Joi, Segments } from 'celebrate'
import { Constants } from '../../common/constants'

export const createPostDto = {
    [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({
        industry_id: Joi.string().trim().required(),
        function_id: Joi.string().trim().required(),
        job_id: Joi.string().trim().required(),
        title: Joi.string().trim().required(),
        city_ids: Joi.array().required(),
        user_id: Joi.string().trim().required(),
        country_id: Joi.string().trim().required(),
        date_off: Joi.number().min(new Date().setHours(0, 0, 0, 0)).required(),
        date_end: Joi.number().min(new Date().setHours(0, 0, 0, 0)).required(),
        full_name: Joi.string().trim().required(),
        job_level: Joi.string().trim().required(),
        job_role_ids: Joi.array(),
        email: Joi.string().trim().regex(/(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/),
        phone: Joi.string().trim(),
        content: Joi.string().trim().required(),
        require: Joi.string().trim().required(),
        benefit: Joi.string().trim().required(),
        salary_from: Joi.number().max(Joi.ref('salary_to')),
        salary_to: Joi.number(),
        negotiable: Joi.boolean(),
        type_work: Joi.string().trim().valid(...Constants.typeWork),
        skill_ids: Joi.array(),
        company_id: Joi.string().trim().required(),
        keywords: Joi.array().min(2).max(10).required(),
        notice_for_referrer: Joi.string().trim().allow('').required(),
        commission: Joi.number().required(),
        currency: Joi.string().trim().valid(...Constants.currency).required(),
        education_level: Joi.string().trim().valid(...Constants.educationLevel).required(),
        guarantee_type: Joi.string().trim().valid(...Constants.guaranteeType).required(),
        guarantee: Joi.number().min(0).max(100),
        guarantee_date: Joi.number().min(0),
        optional_fields: Joi.array(),
        interviews: Joi.array(),
        question_packages: Joi.array().items(Joi.object().options({ abortEarly: false }).keys({
            _id: Joi.string().trim().required(),
            name: Joi.string().trim().required(),
            type_test: Joi.string().trim().required(),
            service_id: Joi.string().trim().required()
        })).max(3),
        language_ids: Joi.array(),
        address: Joi.string().trim().required(),
        require_number: Joi.number().min(0).required(),
        urgency: Joi.boolean().required(),
        security: Joi.boolean().required(),
        bonus: Joi.number().min(0),
        bonus_start_date: Joi.number().min(new Date().setHours(0, 0, 0, 0)),
        bonus_end_date: Joi.number().min(Joi.ref('bonus_start_date')),
    })
}

export const searchPostDto = {
    [Segments.QUERY]: Joi.object().options({ abortEarly: false }).keys({
        keyword_type: Joi.string().trim().required(),
        keyword: Joi.string().trim().required().allow('').trim(),
        companyIds: Joi.string().trim().required(), // 0 la all
        cityIds: Joi.string().trim().required(), // 0 la all
        salaryTo: Joi.number().min(0),
        salaryFrom: Joi.number().min(0),
        negotiable: Joi.string().required(),
        type_work: Joi.string().trim().required(),
        urgency: Joi.string().required(),
        status: Joi.string().trim().required(),
        page_index: Joi.number().required().min(0),
        page_size: Joi.number().required().min(1),
        currency: Joi.string().required(),
        guarantee: Joi.string().required().min(0).max(3), // 0 la all 
        sortBy: Joi.number().required() // 0 là defaul (create date), 1 là job name, 2 company name, 3 la thưởng tang, 4 la thưởng giam, 5 là lương tăng, 6 là lương giảm 

    })
}

export const searchPostByEmployerDto = {
    [Segments.QUERY]: Joi.object().options({ abortEarly: false }).keys({
        keyword: Joi.string().trim().required().allow(''),
        keyword_type: Joi.number().required().min(0).max(1),
        status: Joi.string().trim().required(), // 0 la all
        page_index: Joi.number().required().min(0),
        page_size: Joi.number().required().min(0),
        sortBy: Joi.number().required() // 0 (default, create date), 1 (Name), 2(salary tăng), 3(salary giảm) 
    })
}

export const updatePostDto = {
    [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({
        industry_id: Joi.string().trim(),
        function_id: Joi.string().trim(),
        job_id: Joi.string().trim(),
        title: Joi.string().trim(),
        city_ids: Joi.array(),
        user_id: Joi.string().trim(),
        country_id: Joi.string().trim(),
        date_off: Joi.number().min(new Date().setHours(0, 0, 0, 0)),
        date_end: Joi.number().min(new Date().setHours(0, 0, 0, 0)),
        full_name: Joi.string().trim(),
        job_level: Joi.string().trim(),
        job_role_ids: Joi.array(),
        email: Joi.string().trim().regex(/(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/),
        phone: Joi.string().trim(),
        content: Joi.string().trim(),
        require: Joi.string().trim(),
        benefit: Joi.string().trim(),
        salary_from: Joi.number().max(Joi.ref('salary_to')),
        salary_to: Joi.number(),
        negotiable: Joi.boolean(),
        type_work: Joi.string().trim().valid(...Constants.typeWork),
        skill_ids: Joi.array(),
        views: Joi.number(),
        company_id: Joi.string().trim(),
        update_time: Joi.number().required(),
        keywords: Joi.array().min(2).max(10),
        status: Joi.string().trim().valid(...Constants.postStatus),
        notice_for_referrer: Joi.string().trim().allow(''),
        commission: Joi.number(),
        currency: Joi.string().trim().valid(...Constants.currency),
        education_level: Joi.string().trim().valid(...Constants.educationLevel),
        guarantee_type: Joi.string().trim().valid(...Constants.guaranteeType),
        guarantee: Joi.number().min(0).max(100),
        guarantee_date: Joi.number().min(0),
        optional_fields: Joi.array(),
        interviews: Joi.array(),
        question_packages: Joi.array().items(Joi.object().options({ abortEarly: false }).keys({
            _id: Joi.string().trim().required(),
            name: Joi.string().trim().required(),
            type_test: Joi.string().trim().required(),
            service_id: Joi.string().trim().required()
        })).max(3),
        language_ids: Joi.array(),
        address: Joi.string().trim(),
        require_number: Joi.number().min(0),
        urgency: Joi.boolean(),
        security: Joi.boolean(),
        bonus: Joi.number().min(0),
        bonus_start_date: Joi.number(),
        bonus_end_date: Joi.number().when('bonus_start_date', {
            is: Joi.exist(),
            then: Joi.number().min(Joi.ref('bonus_start_date'))
        }),
    })
}

export const matchingJobDto = {
    [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({
        candidateIds: Joi.array().items(Joi.string().required().regex(/^[a-f\d]{24}$/i)),
        postIds: Joi.array().items(Joi.string().required().regex(/^[a-f\d]{24}$/i))
    })
}
export const downloadJDdto = {
    [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({
        html: Joi.string().required()
    })
}