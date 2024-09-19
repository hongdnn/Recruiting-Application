import { Joi, Segments } from 'celebrate'
import { InterviewStatus } from '../../common/constants'


export const updateScheduleStatusHistory = {
    [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({
        status: Joi.string().trim().valid(...Object.values(InterviewStatus)),
        reason: Joi.string().trim()
    })
}
