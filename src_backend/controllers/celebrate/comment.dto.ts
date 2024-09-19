import {Joi, Segments} from 'celebrate'

export const createComment = {
    [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({
      post_id: Joi.string().required().regex(/^[a-f\d]{24}$/i),
      content: Joi.string().required()
    })
}

export const replyComment = {
    [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({
        content: Joi.string().required(),
        parent_comment_id: Joi.string().required().regex(/^[a-f\d]{24}$/i)
      })
}

export const likeComment = {
  [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({
    commentId: Joi.string().required().regex(/^[a-f\d]{24}$/i)
  })
}

