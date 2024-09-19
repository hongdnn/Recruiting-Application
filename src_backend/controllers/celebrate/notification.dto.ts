import {Joi, Segments} from 'celebrate'

export const searchNotifyDto = {
    [Segments.QUERY]: Joi.object().options({ abortEarly: false }).keys({
        page_index: Joi.number().required().min(0),
        page_size: Joi.number().required().min(0)
    })
}

export const updateNotifyDto = {
    [Segments.PARAMS]: Joi.object().options({ abortEarly: false }).keys({
        id: Joi.string().required().trim().regex(/^[a-f\d]{24}$/i)
    })
}

export const searchNotifyByConditionDto = {
    [Segments.QUERY]: Joi.object().options({ abortEarly: false }).keys({
        type: Joi.number().min(0).max(4).required(),
        date_from: Joi.number(),
        date_to: Joi.number(),
        page_index: Joi.number().required().min(0),
        page_size: Joi.number().required().min(0)
    })
}