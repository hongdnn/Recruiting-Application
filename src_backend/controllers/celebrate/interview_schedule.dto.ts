import { Joi, Segments } from 'celebrate'
import { InterviewStatus } from '../../common/constants'

export const searchInterviewSchedule = {
    [Segments.QUERY]: Joi.object().options({ abortEarly: false }).keys({
        keyword: Joi.string().allow('').required(),
        company_id: Joi.string().required(),
        status: Joi.number().min(0).max(5).required(),
        page_index: Joi.number().required().min(0),
        page_size: Joi.number().required().min(0),
        sort_by: Joi.number().min(-3).max(3).not(0)
    })
}

export const createInterviewSchedule = {
    [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({
        interview_start_date: Joi.number().min(new Date().getTime()).required(),
        interview_end_date: Joi.number().min(Joi.ref('interview_start_date')).required(),
        note: Joi.string().trim(),
        location: Joi.string().trim(),
        candidate_introduction_id: Joi.string().trim().required(),
        interview_id: Joi.string().trim().required(),
        supervisor_id: Joi.string().trim(),
        email: Joi.string().regex(/^[a-z][a-z0-9_.]{5,32}@[a-z0-9]{2,}(.[a-z0-9]{2,4}){1,2}$/),
        email_content: Joi.string().trim(),
        google_meet: Joi.boolean()
    })
}

export const updateInterviewSchedule = {
    [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({
        interview_start_date: Joi.number().min(new Date().getTime()),
        interview_end_date: Joi.number().min(Joi.ref('interview_start_date')),
        note: Joi.string().trim().allow(null),
        location: Joi.string().trim().allow(null),
        supervisor_id: Joi.string().trim(),
        email: Joi.string().regex(/^[a-z][a-z0-9_.]{5,32}@[a-z0-9]{2,}(.[a-z0-9]{2,4}){1,2}$/).allow(null),
        email_content: Joi.string().trim(),
        google_meet: Joi.boolean()
    })
}

export const updateScheduleStatus = {
    [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({
        status: Joi.string().trim().valid(...Object.values(InterviewStatus)).required(),
        reason: Joi.string().trim()
    })
}

export const updateScheduleQuestions = {
    [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({
        questions: Joi.array().items(Joi.object().options({ abortEarly: false }).keys({
            id: Joi.string().trim(),
            question_content: Joi.string().trim().required(),
            answer_point: Joi.number().min(1).max(10),
            action: Joi.string().trim().allow(null).required(),
        }))
    })
}