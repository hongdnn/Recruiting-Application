import {Joi, Segments} from 'celebrate'
import { Constants, PaymentStatus } from '../../common/constants'

export const searchPlacementbyCollaboratorDto = {
    [Segments.QUERY]: Joi.object().options({ abortEarly: false }).keys({
        keyword: Joi.string().required().allow('').trim(),
        companyIds: Joi.string().required().regex(/^[0]$|^[a-f\d]{24}$/i),
        paymentStatus: Joi.string().required().regex(/^[0,1,2,3]{1}$/), // 0 la all
        pageIndex: Joi.number().required().min(0),
        pageSize: Joi.number().required().min(0),
        sortBy: Joi.number().required() // 0 (created date default), 1 (candidate name), 2 (Profile title), 3 Reward
    })
}

export const searchPlacementByEmployerDto = {
    [Segments.QUERY]: Joi.object().options({ abortEarly: false }).keys({
        keyword: Joi.string().required().allow('').trim(),
        companyIds: Joi.string().required().regex(/^[0]$|^[a-f\d]{24}$/i),
        collaborator_id: Joi.string(),
        paymentStatus: Joi.string().required().regex(/^[0,1,2,3]{1}$/), // 0 la all
        pageIndex: Joi.number().required().min(0),
        pageSize: Joi.number().required().min(0),
        sortBy: Joi.number().required() // 0 (created date default), 1 (candidate name), 2 (Profile title), 3 Reward
    })
}

export const createPlacementDto = {
    [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({
        candidate_introduction_id: Joi.string().required().regex(/^[a-f\d]{24}$/i),
        reward_amount: Joi.array().required().items(Joi.number().required().min(0)).min(1), //
        placement_date: Joi.array().required().items(Joi.number().required().min(0)).min(1),
        payment_status: Joi.array().required().items(Joi.string().trim().valid(...Object.values(PaymentStatus)).required()).min(1),
        currency: Joi.string().trim().valid(...Constants.currency).required(),
        bonus: Joi.number().required().allow(null).min(0)
    })
}

export const updateStatusDto = {
    [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({
        placementId: Joi.string().required().regex(/^[a-f\d]{24}$/i),
        status: Joi.array().required().items(Joi.string().required().regex(/^[1,2,3]{1}$/)).min(1)
    })
}
export const exportExcelDto = {
    [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({
        dataToExport: Joi.array().items(Joi.object().options({ abortEarly: false }).keys({
            candidate_introduction_id: Joi.string().required().regex(/^[a-f\d]{24}$/i),
            candidateName: Joi.string().required(),
            postTitle: Joi.string().required(),
            company: Joi.string().required(),
            collaboratorName: Joi.string().required(),
            collaboratorEmail: Joi.string().required(),
            collaboratorPhone: Joi.string().required(),
            bankName: Joi.string().required(),
            bankAccountName: Joi.string().required(),
            bankNumber: Joi.string().required(),
            rewardAmount: Joi.array().required(),
            bonus: Joi.number().required().allow(null),
            currency: Joi.string().trim().valid(...Constants.currency).required(),
            placementDate: Joi.array().required(),
            status: Joi.array().required().items(Joi.string().trim().valid(...Object.values(PaymentStatus)).required()).min(1),
            percentWarranty: Joi.string().required(),
            warrantyType: Joi.string().required()
          })).required()
    })
}