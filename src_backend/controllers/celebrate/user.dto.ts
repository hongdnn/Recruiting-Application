import {Joi, Segments} from 'celebrate'
import { Constants } from '../../common/constants'


export const createUserDto = {
    [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({
        last_name: Joi.string().required(),
        first_name: Joi.string().required(),
        email: Joi.string().required().regex(/^[a-z][a-z0-9_.]{5,32}@[a-z0-9]{2,}(.[a-z0-9]{2,4}){1,2}$/),
        password: Joi.string().trim().required(),
        phone: Joi.string().trim().required(),
        type_account: Joi.string().trim().required().valid(...Constants.accountType)
    })

}

export const loginSocialAccountDto = {
    [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({
        last_name: Joi.string().required(),
        first_name: Joi.string().allow('').required(),
        email: Joi.string().required().regex(/^[a-z][a-z0-9_.]{5,32}@[a-z0-9]{2,}(.[a-z0-9]{2,4}){1,2}$/)
    })

}


export const loginDto = {
    [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({ // segments. có thể check header, query, param bla bla
        email: Joi.string().trim().required().regex(/^[a-z][a-z0-9_.]{0,32}@[a-z0-9]{2,}(.[a-z0-9]{2,4}){1,2}$/),
        password: Joi.string().trim().required()
    })
}

// COLLAB
export const changePasswordDto = {
    [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({
        old_password: Joi.string().required(),
        new_password: Joi.string().required(),
        re_password: Joi.string().required()
    })
}

export const updateCollabDto = {
    [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({
        first_name: Joi.string().trim(),
        last_name: Joi.string().trim(),
        address: Joi.string().trim().allow(''),
        birth_day: Joi.string().trim(),
        phone: Joi.string().trim(),
        additional_information: Joi.string().trim(),
        job_role_ids: Joi.array().max(5),
        job_levels: Joi.string().allow(null),
        job_industries_ids: Joi.array().max(3),
        candidate_skill_ids: Joi.array().max(10),
        proficient_language_ids: Joi.array().max(3),
        locations_ids: Joi.array().max(3),
        facebook: Joi.string().trim(),
        linkedin: Joi.string().trim(),
        skype: Joi.string().trim(),
        image: Joi.string().trim().allow(null)
    })
}



// EMPLOYER
export const updateEmployerDto = {
    [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({
        first_name: Joi.string().trim(),
        last_name: Joi.string().trim(),
        address: Joi.string().trim(),
        birth_day: Joi.string().trim(),
        phone: Joi.string().trim(),
        status: Joi.string().trim().valid(...Constants.userStatus),
        permission_ids: Joi.array().items(Joi.string().trim()),
        gender: Joi.string().trim(),
        image: Joi.string().trim().allow(null),
        additional_information: Joi.string().trim()
    })
}

export const createEmployerDto = {
    [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({
        first_name: Joi.string().trim().required(),
        last_name: Joi.string().trim().required(),
        email: Joi.string().trim().required(),
        password: Joi.string().trim().required(),
        address: Joi.string().trim(),
        birth_day: Joi.string().trim(),
        phone: Joi.string().trim(),
        status: Joi.string().trim().valid(...Constants.userStatus).required(),
        permission_ids: Joi.array().items(Joi.string().trim()),
        gender: Joi.string().trim(),
        image: Joi.string().trim(),
        additional_information: Joi.string().trim()
    })
}

export const forgotPasswordDto = {
    [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({
        email: Joi.string().required().regex(/^[a-z][a-z0-9_.]{0,32}@[a-z0-9]{2,}(.[a-z0-9]{2,4}){1,2}$/)
    })
}

export const resetPasswordDto = {
    [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({
        email: Joi.string().required().regex(/^[a-z][a-z0-9_.]{0,32}@[a-z0-9]{2,}(.[a-z0-9]{2,4}){1,2}$/),
        password: Joi.string().required(),
        verification_code: Joi.string().required()
    })
}

export const updateFCMDto = {
    [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({ // segments. có thể check header, query, param bla bla
        fcm_token: Joi.string().trim().required()
    })
}

export const searchStaffDto = {
    [Segments.QUERY]: Joi.object().options({ abortEarly: false }).keys({
        keyword: Joi.string().trim().required().allow(''),
        status: Joi.number().min(0).max(3).required(),
        page_index: Joi.number().required().min(0),
        page_size: Joi.number().required().min(0),
        sortBy: Joi.number().min(-2).max(2).required()
    })
}

export const searchCollaboratorDto = {
    [Segments.QUERY]: Joi.object().options({ abortEarly: false }).keys({
        keyword: Joi.string().trim().required().allow(''),
        status: Joi.string().required().regex(/^[0,1,2,3,4]{1}$/).trim(),
        pageIndex: Joi.number().required().min(0),
        pageSize: Joi.number().required().min(0),
        sortBy: Joi.number().min(0).max(1).required()
    })
}

export const updateStatusCollaboratorByEmployer = {
    [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({ // segments. có thể check header, query, param bla bla
        collaboratorId: Joi.string().trim().required().regex(/^[a-f\d]{24}$/i),
        status: Joi.string().required().regex(/^[1,2,3,4]{1}$/).trim()
    })
}
