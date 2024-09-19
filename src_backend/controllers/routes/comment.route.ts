import { celebrate } from "celebrate"
import { Request, Router } from "express"
import { myContainer } from "../../inversify.config"
import { authenticate, authorize } from "../../middlewares/middleware"
import { TYPES } from "../../types"
import { createComment, likeComment, replyComment } from "../celebrate/comment.dto"
import { ICommentService } from "../services/comment.service"

export const commentRouter = Router()



const commentService: ICommentService = myContainer.get<ICommentService>(TYPES.ICommentService)

commentRouter.get('/', async (req, res) => {
    try {
        const postId = ''+req.query.postId
        const comments = await commentService.getComments(postId)
        if(comments.status === 0){
            return res.status(200).json(comments)
        }
        return res.status(400).json(comments)
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
})

commentRouter.post('/',[authenticate, authorize(['collaborator', 'employer']),  celebrate(createComment)], async (req, res) => {
    try {
        const bearerToken = req.headers.authorization
        const dto = req.body
        const result = await commentService.createComment(bearerToken, dto)
        if(result.status === 0 ){
          return res.status(200).json(result)
        }
        return res.status(400).json(result)
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
})
commentRouter.post('/reply-comment',[authenticate, authorize(['employer', 'collaborator']), celebrate(replyComment)], async (req, res) => {
    try {
        const bearerToken = req.headers.authorization
        const dto = req.body
        const result = await commentService.replyComment(bearerToken,dto)
        if(result.status === 0 ){
           return res.status(200).json(result)
        }
        return res.status(400).json(result)
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
})

commentRouter.post('/like-comment', [authenticate, authorize(['employer','collaborator']), celebrate(likeComment)], async(req,res)=>{
    try {
        const bearerToken = req.headers.authorization
        const commentId = req.body.commentId
        const result = await commentService.likeComment(bearerToken,commentId)
        if(result.status === 0 ){
           return res.status(200).json(result)
        }
        return res.status(400).json(result)
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
})

commentRouter.get('/getlikedcommentofpost/:id', [authenticate, authorize(['employer','collaborator'])], async(req,res)=>{
    try {
        const bearerToken = req.headers.authorization
        const postId = req.params.id
        const result = await commentService.getCommentsLikedByUser(bearerToken,postId)
        if(result.status === 0 ){
           return res.status(200).json(result)
        }
        return res.status(400).json(result)
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
})