/**
 * Required External Modules and Interfaces
 */
import { Request, Response, Router } from 'express'
import { TYPES } from '../../types'
import { myContainer } from '../../inversify.config';
import { celebrate } from 'celebrate'
import { ISavePostService, SavePostService } from '../services/save_post.service';
import { createSavedPost } from '../celebrate/saved_post.dto';
import { searchPostDto } from '../celebrate/post.dto';

/**
 * Router Definition
 */

export const savedPostRouter = Router()



const savedPostService: ISavePostService = myContainer.get<ISavePostService>(TYPES.ISavePostService)

savedPostRouter.post('/', celebrate(createSavedPost), async (req, res) => {
    try {
        const dto = req.body
        const token = req.headers.authorization
        const result = await savedPostService.createSavedPost(token, dto)
        if (result.status === 0) {
            return res.status(200).json(result)
        }
        return res.status(400).json(result)
    } catch (error) {
        return res.status(500).json({ error })
    }
})

savedPostRouter.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id
        const token = req.headers.authorization
        const result = await savedPostService.unsavedPost(token, id)
        if (result.status === 0) {
            return res.status(200).json(result)
        }
        return res.status(400).json(result)
    } catch (error) {
        return res.status(500).json({ error });
    }
})

savedPostRouter.get('/', celebrate(searchPostDto), async(req,res)=>{
    try {
        const token = req.headers.authorization
        let condition = {
            keyword_type: req.query.keyword_type,
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
            guarantee : req.query.guarantee
        }
        const result = await savedPostService.getSavePosts(token, condition,  parseInt('' + req.query.page_index), parseInt('' + req.query.page_size), parseInt('' + req.query.sortBy))
        return res.status(200).json(result)
    } catch (error) {
        return res.status(500).json({ error})
    }
 })



