/**
 * Required External Modules and Interfaces
 */

import { Request, Response, Router } from 'express'
import { TYPES } from '../../types'
import { myContainer } from '../../inversify.config';
import { celebrate } from 'celebrate'
import { createPostDto, searchPostDto, searchPostByEmployerDto, updatePostDto, matchingJobDto, downloadJDdto } from '../celebrate/post.dto'
import { IPostService } from '../services/post.service';
import { authenticate, authorize } from '../../middlewares/middleware';
import pdf from'html-pdf'
import fs from 'fs'
/**
 * Router Definition
 */

export const postRouter = Router()



const postService: IPostService = myContainer.get<IPostService>(TYPES.IPostService)

postRouter.post('/', [authenticate, authorize(['employer']), celebrate(createPostDto)], async (req, res) => {
    try {
        const bearerToken = req.headers.authorization
        const dto = req.body
        const createdUser = await postService.createPost(bearerToken, dto)
        if (typeof createdUser === "string") {
            return res.status(400).json({ message: createdUser })
        }
        return res.status(200).json({ data: createdUser })
    } catch (error) {
        return res.status(500).json({ errors: error.errors })
    }
})

postRouter.get('/detail/:id', async (req, res) => {
    try {
        const id = req.params.id
        const result = await postService.viewDetailPost(id)
        if(result.status === 0){
            return res.status(200).json(result)
        }
        return res.status(400).json(result)
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error })
    }
})
postRouter.get('/detailforupdate/:id', [authenticate, authorize(['employer'])], async (req, res) => {
    try {
        const id = req.params.id
        const bearerToken = req.headers.authorization
        const result = await postService.viewDetailPostForUpdate(bearerToken, id)
        return res.status(200).json(result)
    } catch (error) {
        // console.log(error);
        return res.status(500).json({ error })
    }
})

postRouter.get('/view-tracking/:id', async (req, res) => {
    try {
        const postId = req.params.id
        const result = await postService.trackingView(postId)
        if (result.status === 0) {
            return res.status(200).json(result)
        }
    } catch (error) {
        return res.status(500).json(error)
    }
})


// token: nQ8v4UNL8kR8B02f6PiVnwnV4NMiMCn47JtTfn0v
postRouter.get('/searchbyemployer', [authenticate, authorize(['employer']), celebrate(searchPostByEmployerDto)], async (req, res) => {
    try {
        let condition = {
            keyword: req.query.keyword,
            keyword_type: req.query.keyword_type,
            status: req.query.status
        }
        const bearerToken = req.headers.authorization
        const sortBy = req.query.sortBy
        const result = await postService.searchPostByEmployer(bearerToken, condition, parseInt('' + req.query.page_index), parseInt('' + req.query.page_size), parseInt('' + sortBy))
        if (result.status === 0) {
            return res.status(200).json(result);
        }
        return res.status(400).json(result);

    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
})



postRouter.get('/', celebrate(searchPostDto), async (req, res) => {
    try {
        let condition = {
            keywordType: req.query.keyword_type,
            keyword: req.query.keyword,
            company_id: req.query.companyIds,
            city_ids: req.query.cityIds,
            salary_from: req.query.salaryFrom,
            salary_to: req.query.salaryTo,
            status: req.query.status,
            urgency: req.query.urgency,
            negotiable: req.query.negotiable,
            type_work: req.query.type_work,
            currency: req.query.currency,
            guarantee: req.query.guarantee
        }
        const sortBy = req.query.sortBy
        const bearerToken = req.headers.authorization
        const result = await postService.searchPostByCollaborator(bearerToken, condition, parseInt('' + req.query.page_index), parseInt('' + req.query.page_size), parseInt('' + sortBy))
        return res.status(200).json(result);

    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
})

postRouter.get('/searchposttomatch', [authenticate, authorize(['collaborator']), celebrate(searchPostDto)], async (req, res) => {
    try {
        let condition = {
            keywordType: req.query.keyword_type,
            keyword: req.query.keyword,
            company_id: req.query.companyIds,
            city_ids: req.query.cityIds,
            salary_from: req.query.salaryFrom,
            salary_to: req.query.salaryTo,
            status: req.query.status,
            urgency: req.query.urgency,
            negotiable: req.query.negotiable,
            type_work: req.query.type_work,
            guarantee: req.query.guarantee,
            currency: req.query.currency
        }
        const result = await postService.searchPostToMatch(condition, parseInt('' + req.query.page_index), parseInt('' + req.query.page_size), parseInt('' + req.query.sortBy))
        return res.status(200).json(result);

    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
})

postRouter.post('/matching', [authenticate, authorize(['collaborator']), celebrate(matchingJobDto)], async (req, res) => {
    try {
        const candidateIds = req.body.candidateIds
        const postIds = req.body.postIds
        const result = await postService.matchJob(candidateIds, postIds)
        return res.status(200).json(result);

    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
})

postRouter.put('/:id', [authenticate, authorize(['employer']), celebrate(updatePostDto)], async (req, res) => {
    try {
        const bearerToken = req.headers.authorization
        const id = req.params.id
        const dto = req.body
        const result = await postService.updatePost(bearerToken, id, dto)
        if (typeof result === "string") {
            return res.status(400).json({ message: result })
        }
        return res.status(200).json({ data: result })
    } catch (error) {
        return res.status(500).json({ error })
    }
})


postRouter.get('/statistic', [authenticate, authorize(['employer'])], async (req, res) => {
    try {
        const bearerToken = req.headers.authorization
        const result = await postService.getPostCountForEmployer(bearerToken)
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json(error)
    }
})

postRouter.get('/statisticbycollaborator', [authenticate, authorize(['collaborator'])], async (req, res) => {
    try {
        const token = req.headers.authorization
        const result = await postService.getPostCountForCollaborator(token)
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json(error)
    }
})

postRouter.get('/questionpackages', [authenticate, authorize(['employer'])], async (req, res) => {
    try {
        const token = req.headers.authorization
        const result = await postService.getQuestionPackages(token)
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json(error)
    }
})
postRouter.post('/downloadJD',celebrate(downloadJDdto), async (req, res) => {
    try {
        const html = req.body.html
        const filename = new Date().getTime()+'.pdf'
         pdf.create(html).toFile('./assets/'+filename, function(err, result) {
            if (err) return res.status(500).json({error: 'Can not download.'})
            return res.download(result.filename, () =>{
                fs.unlinkSync(result.filename)
            })
          });
       
    } catch (error) {
        console.log(error);

        return res.status(500).json(error)
    }
})


