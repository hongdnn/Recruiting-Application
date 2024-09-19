import {Joi, Segments} from 'celebrate'

export const createBankAccount = {
    [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({
        bank_name: Joi.string().trim().required(),
        account_number: Joi.string().trim().required(),
        account_username: Joi.string().trim().required(),
        bank_account_fullname: Joi.string().trim().required(),
        id_number: Joi.string().trim().required(),
        id_card_date: Joi.string().regex(/^(19[7-9][0-9]|20[0-9][0-9])[/](0?[1-9]|1[0-2])[/](0?[1-9]|[12][0-9]|3[01])$/).required(),
        issued_location: Joi.string().trim().required(),
        front_side_image: Joi.string().trim().required(),
        back_side_image: Joi.string().trim().required()
    })
}

export const updateBankAccount ={
    [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({
        bank_name: Joi.string().trim(),
        account_number: Joi.string().trim(),
        account_username: Joi.string().trim().required(),
        bank_account_fullname: Joi.string().trim(),
        id_number: Joi.string().trim(),
        id_card_date: Joi.number(),
        issued_location: Joi.string().trim(),
        front_side_image: Joi.string().trim(),
        back_side_image: Joi.string().trim()
    })
}