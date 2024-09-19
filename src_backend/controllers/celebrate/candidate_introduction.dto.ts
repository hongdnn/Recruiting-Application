import { Joi, Segments } from 'celebrate'
import { Constants, IntroductionStatus } from '../../common/constants'

export const getCandidateOfPost = {
  [Segments.QUERY]: Joi.object().options({ abortEarly: false }).keys({
    post_id: Joi.string().required().trim().regex(/^[a-f\d]{24}$/i),
    page_index: Joi.number().required().min(0),
    page_size: Joi.number().required().min(0),
    sort_by: Joi.string().required().min(0),
    status: Joi.string().required()
  })
}
export const searchCandidateIntroductionByEmployerDto = {
  [Segments.QUERY]: Joi.object().options({ abortEarly: false }).keys({
    keyword: Joi.string().allow('').trim(),
    company_ids: Joi.string().required(),
    status: Joi.string().required(),
    page_index: Joi.number().required().min(0),
    introduction_date_from: Joi.number(),
    introduction_date_to: Joi.number(),
    page_size: Joi.number().required().min(0),
    sort_by: Joi.number().required() // 0 (apply date default), 1 (candidate name), 2 (job title)
  })
}

export const searchCandidateIntroductionOfCollaboratorDto = {
  [Segments.QUERY]: Joi.object().options({ abortEarly: false }).keys({
    keyword: Joi.string().allow('').trim(),
    collaborator_id: Joi.string().required().regex(/^[a-f\d]{24}$/i),
    company_ids: Joi.string().required(),
    status: Joi.string().required(),
    page_index: Joi.number().required().min(0),
    introduction_date_from: Joi.number(),
    introduction_date_to: Joi.number(),
    page_size: Joi.number().required().min(0),
    sort_by: Joi.number().required() // 0 (apply date default), 1 (candidate name), 2 (job title)
  })
}

export const searchCandidateIntroductionByCollaboratorDto = {
  [Segments.QUERY]: Joi.object().options({ abortEarly: false }).keys({
    keyword: Joi.string().allow('').trim(),
    company_ids: Joi.string().required(),
    status: Joi.string().required(),
    page_index: Joi.number().required().min(0),
    page_size: Joi.number().required().min(0),
    introduction_date_from: Joi.number(),
    introduction_date_to: Joi.number(),
    sort_by: Joi.number().required() // 0 (apply date default), 1 (candidate name), 2 (job title)
  })
}

export const searchCandidateIntroductionToWarrantyDto = {
  [Segments.QUERY]: Joi.object().options({ abortEarly: false }).keys({
    keyword: Joi.string().allow('').trim(),
    postId: Joi.string().required().regex(/^[a-f\d]{24}$/i),
    page_index: Joi.number().required().min(0),
    page_size: Joi.number().required().min(0),
    sort_by: Joi.number().required() // 0 (apply date default), 1 (candidate name), 2 (job title)
  })
}
export const cancelReferDto = {
  [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({
    candidateIntroductionId: Joi.string().required().regex(/^[a-f\d]{24}$/i),
    postId: Joi.string().required().regex(/^[a-f\d]{24}$/i),
    reason: Joi.string().required()
  })
}

export const updateStatusCandidateIntroduction = {
  [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({
    candidateIntroductionId: Joi.string().required().regex(/^[a-f\d]{24}$/i),
    note: Joi.string().required().allow(null),
    status: Joi.string().required(),
    onboardDate: Joi.string().required().allow(null),
    workEndDate: Joi.string().required().allow(null)
  })
}
export const searchReportDto = {
  [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({
    reportBy: Joi.string().valid(...Constants.reportBy).required(),
    date: Joi.string().regex(/([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/).required(),
    number: Joi.number().min(1).required(),
    statuses: Joi.array().items(Joi.string().allow('Job Refer').valid(...Object.values(IntroductionStatus))).required()
  })
}

export const reportForPostDto = {
  [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({
    post_ids: Joi.array().required()
  })
}

export const exportExcelDto = {
  [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({
    data: Joi.array().required().min(1)
  })
}

export const inviteTestDto = {
  [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({
    candidate_introduction_id: Joi.string().trim().required(),
    email: Joi.string().trim().regex(/^[a-z][a-z0-9_.]{5,32}@[a-z0-9]{2,}(.[a-z0-9]{2,4}){1,2}$/).required(),
    question_packages: Joi.array().items(Joi.object().options({ abortEarly: false }).keys({
      _id: Joi.string().trim().required(),
      name: Joi.string().trim().required(),
      type_test: Joi.string().trim().required(),
      service_id: Joi.string().trim().required()
    })).max(3).required(),
    invited_at: Joi.number().min(0).max(9999999999).required(),
    expired: Joi.number().min(Joi.ref('invited_at')).max(9999999999).required()
  })
}

export const reportTestDto = {
  [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({
    candidate_introduction_id: Joi.string().trim().required().regex(/^[a-f\d]{24}$/i),
    question_packages: Joi.array().items(Joi.object().options({ abortEarly: false }).keys({
      _id: Joi.string().trim().required(),
      name: Joi.string().trim().required(),
      type_test: Joi.string().trim().required(),
      service_id: Joi.string().trim().required()
    })).max(3).required()
  })
}

export const warrantyCandidateDto = {
  [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({
    guaranteed_candidate_introuduction_id: Joi.string().required().regex(/^[a-f\d]{24}$/i),
    alternative_candidate_introuduction_id: Joi.string().required().regex(/^[a-f\d]{24}$/i)
  })
}
