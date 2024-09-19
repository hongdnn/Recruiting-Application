import { celebrate } from "celebrate"
import { Request, Response, Router } from "express"
import { myContainer } from "../../inversify.config"
import logger from "../../logger/winston"
import { authenticate, authorize } from "../../middlewares/middleware"
import { uploadCv } from "../../multer"
import { TYPES } from "../../types"
import { createCandidateDto, referCandidateDto, searchCandidateDto, searchCandidateToMatchDto, selfAppliedCandidateDto, updateCandidateDto, updateStatusCandidateDto } from "../celebrate/candidate.dto"
import { CandidateService } from "../services/candidate.service"

export const candidateRouter = Router()



const candidateService: CandidateService = myContainer.get<CandidateService>(TYPES.ICandidateService)

candidateRouter.get('/', [authenticate, authorize(['collaborator']), celebrate(searchCandidateDto)], async (req, res) => {
    try {
        const condition = {
            salary_from: req.query.salary_from,
            salary_to: req.query.salary_to,
            date_created_from: req.query.date_from,
            date_created_to: req.query.date_to,
            city_ids: req.query.city_ids,
            keyword_cv_require: req.query.keyword_cv_require,
            postId: req.query.postId,
            currency: req.query.currency
        }
        const bearerToken = req.headers.authorization
        const result = await candidateService.searchCandidate(bearerToken, condition, parseInt('' + req.query.page_index), parseInt('' + req.query.page_size), parseInt('' + req.query.sort_by))
        return res.status(200).json(result)
    } catch (error) {
        logger.error(new Error(error.toString()))
        return res.status(500).json({error: "Server Error"})
    }
})



candidateRouter.post('/', [authenticate, authorize(['collaborator']), celebrate(createCandidateDto)], async (req: Request, res: Response) => {
    try {
        const dto = req.body
        const bearerToken = req.headers.authorization
        const result = await candidateService.createCandidate(bearerToken, dto)
        if (result.status === 0) {
            return res.status(200).json(result)
        }
        return res.status(400).json(result);

    } catch (error) {
        logger.error(new Error(error.toString()))
        return res.status(500).json({error: "Server Error"})
    }
})

candidateRouter.delete('/:id',[authenticate, authorize(['collaborator'])], async(req, res)=>{
    try {
        const candidateId = req.params.id
        const bearerToken = req.headers.authorization
        const result = await candidateService.removeCandidate(bearerToken, candidateId)
        if(result.status === 0){
            return res.status(200).json(result)
        }
        return res.status(400).json(result)
    } catch (error) {
        logger.error(new Error(error.toString()))
        return res.status(500).json({error: "Server Error"})
    }
})

candidateRouter.put('/:id', [authenticate, authorize(['collaborator']), celebrate(updateCandidateDto)], async(req: Request,res: Response)=>{
    try {
        const dto = req.body
        dto['id'] = req.params.id
        const bearerToken = req.headers.authorization
        const result = await candidateService.updateCandidate(bearerToken,dto)
        if(result.status === 0){
            return res.status(200).json(result)
        }
        return res.status(400).json(result);
        
    } catch (error) {
        logger.error(new Error(error.toString()))
        return res.status(500).json({error: "Server Error"})
    }
})

candidateRouter.put('/updatestatusbycollaborator/:id', [authenticate, authorize(['collaborator']), celebrate(updateStatusCandidateDto)], async(req: Request,res: Response)=>{
    try {
        const status = req.body.status
        const id = req.params.id
        const bearerToken = req.headers.authorization
        const result = await candidateService.updateStatusCandidate(bearerToken, id,status)
        // console.log(dto);
        if(result.status === 0){
            return res.status(200).json(result);
        }
        return res.status(400).json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
})


candidateRouter.post('/uploadcv', uploadCv, async (req: Request, res: Response) => {
    try {
        const file = req.file
        const result = await candidateService.uploadcv(file)
        return res.status(200).json(result)
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
})

candidateRouter.post('/updatecv/:id',[authenticate, authorize(['collaborator']), uploadCv], async(req: Request,res: Response)=>{
    try {
        const file = req.file
        const candidateId = req.params.id
        const bearerToken = req.headers.authorization
        const result = await candidateService.updateCv(bearerToken,file, candidateId)
        if(result.status === 0){
            return res.status(200).json(result)
        }
        return res.status(400).json(result)        
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
})

candidateRouter.post('/refer', [authenticate, authorize(['collaborator']), celebrate(referCandidateDto)], async(req,res)=>{
    try {
        const postId = req.body.postId;
        const candidateId = req.body.candidateId
        const bearerToken = req.headers.authorization
        const optionalFieldsValue = req.body.optionalFieldsValue 
        const result = await candidateService.referCandidate(bearerToken, candidateId, postId, optionalFieldsValue)
        if (result.status === 0) {
            return res.status(200).json(result)
        }
        return res.status(400).json(result)
    } catch (error) {
        return res.status(500).json(error)
    }
})

candidateRouter.post('/referbycandidate', celebrate(selfAppliedCandidateDto), async(req,res)=>{
    try {
        const dto = req.body
        const result = await candidateService.referByCandidate(dto)
        if (result.status === 0) {
            return res.status(200).json(result)
        }
        return res.status(400).json(result)
    } catch (error) {
        logger.error(new Error(error.toString()))
        return res.status(500).json({error: "Server Error"})
    }
})

candidateRouter.get('/:id',[authenticate, authorize(['collaborator'])], async (req, res) => {
    try {
        const id = req.params.id
        const bearerToken = req.headers.authorization
        const result = await candidateService.getCandidateDetailForCollab(bearerToken, id)
        if (result.status === 1) {
            return res.status(400).json(result)
        }
        return res.status(200).json(result)
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
})

candidateRouter.get('/matchingjob/searchcandidatetomatch',[authenticate, authorize(['collaborator']), celebrate(searchCandidateToMatchDto)], async (req, res) => {
    try {
        const condition = {
            salary_from: req.query.salary_from,
            salary_to: req.query.salary_to,
            date_created_from: req.query.date_from,
            date_created_to: req.query.date_to,
            negotiable: req.query.negotiable,
            city_ids: req.query.city_ids,
            keyword_cv: req.query.keyword_cv,
            currency: req.query.currency
        }
        const pageIndex = parseInt(''+req.query.page_index)
        const pageSize = parseInt(''+req.query.page_size)
        const bearerToken = req.headers.authorization
        const result = await candidateService.searchCandidateToMatch(bearerToken,condition,pageIndex,pageSize)
        return res.status(200).json(result)
    } catch (error) {
        logger.error(new Error(error.toString()))
        return res.status(500).json({error: "Server Error"})
    }
})

candidateRouter.get('/downloadCV/:id',[authenticate, authorize(['collaborator','employer'])], async (req, res) => {
    try {
        const candidateId = req.params.id
        const bearerToken = req.headers.authorization
        const result = await candidateService.downloadCvFile(bearerToken, candidateId)
        if(result.status === 0 ){
            res.download(result.path)
        }else{
            return res.status(400).json(result)
        }
    } catch (error) {
        logger.error(new Error(error.toString()))
        return res.status(500).json({error: "Server Error"})
    }
})
