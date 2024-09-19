import {Joi, Segments} from 'celebrate'

export const createSavedPost = {
    [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({
      post_id: Joi.string().required().regex(/^[a-f\d]{24}$/i)
    })
}

