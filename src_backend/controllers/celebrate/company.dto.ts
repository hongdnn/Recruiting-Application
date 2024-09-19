import {Joi, Segments} from 'celebrate'

export const createCompany = {
    [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({
      industry_id: Joi.string().required().trim().regex(/^[a-f\d]{24}$/i),
      function_id: Joi.string().required().allow(null).trim().regex(/^[a-f\d]{24}$/i),
      job_id: Joi.string().required().allow(null).trim().regex(/^[a-f\d]{24}$/i),
      country_id: Joi.string().required().allow(null).trim().regex(/^[a-f\d]{24}$/i),
      city_id: Joi.string().required().allow(null).trim().regex(/^[a-f\d]{24}$/i),
      contact_name: Joi.string().required().trim(),
      email: Joi.string().trim().regex(/(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/),
      phone: Joi.string().required().trim(),
      address: Joi.string().required().trim(),
      company: Joi.string().required().trim(),
      website: Joi.string().required().allow('').trim(),
      introduction: Joi.string().required().allow('').trim(),
      image_new_path: Joi.string().required()
    })
}

export const updateCompany = {
  [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({
    industry_id: Joi.string().required().trim().regex(/^[a-f\d]{24}$/i),
    function_id: Joi.string().required().allow(null).trim().regex(/^[a-f\d]{24}$/i),
    job_id: Joi.string().required().allow(null).trim().regex(/^[a-f\d]{24}$/i),
    country_id: Joi.string().required().allow(null).trim().regex(/^[a-f\d]{24}$/i),
    city_id: Joi.string().required().allow(null).trim().regex(/^[a-f\d]{24}$/i),
    contact_name: Joi.string().required().trim(),
    email: Joi.string().trim().regex(/(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/),
    phone: Joi.string().required().trim(),
    company: Joi.string().required().trim(),
    address: Joi.string().required().trim(),
    website: Joi.string().required().allow('').trim(),
    introduction: Joi.string().required().allow('').trim(),
    image_new_path: Joi.string().required().allow(null)
  })
}

export const searchCompanyDto = {
  [Segments.QUERY]: Joi.object().options({ abortEarly: false }).keys({
    keyword: Joi.string().required().allow('').trim(),
    industryId: Joi.string().required().regex(/^[0]$|^[a-f\d]{24}$/i),
    pageIndex: Joi.number().required().min(0),
    pageSize: Joi.number().required().min(0),
    sortBy: Joi.number().required() // 0 created date, 1 company name 
  })
}