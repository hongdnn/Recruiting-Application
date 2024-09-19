import {Joi, Segments} from 'celebrate'
import { Constants } from '../../common/constants'

export const createWarrantyDto = {
    [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({
        guaranteed_candidate_introuduction_id: Joi.string().required().regex(/^[a-f\d]{24}$/i),
        alternative_candidate_introuduction_id: Joi.string().required().regex(/^[a-f\d]{24}$/i)
    })
}