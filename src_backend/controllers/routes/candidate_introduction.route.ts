import { celebrate } from "celebrate"
import { Request, Router } from "express"
import { myContainer } from "../../inversify.config"
import logger from "../../logger/winston"
import { authenticate, authorize } from "../../middlewares/middleware"
import { TYPES } from "../../types"
import { cancelReferDto, getCandidateOfPost, searchCandidateIntroductionByCollaboratorDto, searchCandidateIntroductionByEmployerDto, updateStatusCandidateIntroduction, searchReportDto, exportExcelDto, reportForPostDto, inviteTestDto, warrantyCandidateDto, searchCandidateIntroductionToWarrantyDto, reportTestDto, searchCandidateIntroductionOfCollaboratorDto } from "../celebrate/candidate_introduction.dto"
import { ICandidateIntroductionService } from "../services/candidate_introduction.service"


export const candidateIntroductionRouter = Router()



const candidateIntroductionService: ICandidateIntroductionService = myContainer.get<ICandidateIntroductionService>(TYPES.ICandidateIntroductionService)

candidateIntroductionRouter.get('/', [authenticate, authorize(['employer', 'collaborator']), celebrate(getCandidateOfPost)], async (req, res) => {
    try {
        const condition = {
            post_id: req.query.post_id,
            status: req.query.status
        }
        const pageIndex = parseInt('' + req.query.page_index)
        const pageSize = parseInt('' + req.query.page_size)
        const sortBy = parseInt('' + req.query.sort_by)
        const bearerToken = req.headers.authorization
        const result = await candidateIntroductionService.getCandidatesOfPost(bearerToken, condition, pageIndex, pageSize, sortBy)
        if (result.status === 0) {
            return res.status(200).json(result)
        }
        return res.status(400).json(result)
    } catch (error) {
        logger.error(new Error(error.toString()))
        return res.status(500).json({error: "Server Error"})
    }
})

candidateIntroductionRouter.get('/searchbyemployer', [authenticate, authorize(['employer']), celebrate(searchCandidateIntroductionByEmployerDto)], async (req: Request, res) => {
    try {
        const condition = {
            keyword: req.query.keyword, // search theo ten candidate and post title
            company_ids: req.query.company_ids,
            status: req.query.status,
            introduction_date_from: req.query.introduction_date_from,
            introduction_date_to: req.query.introduction_date_to
        }
        const bearerToken = req.headers.authorization
        const result = await candidateIntroductionService.searchCandidateIntroductionForEmployer(bearerToken, condition, parseInt('' + req.query.page_index), parseInt('' + req.query.page_size), parseInt('' + req.query.sort_by))
        if (result.status === 0) {
            return res.status(200).json(result)
        }
        return res.status(400).json(result)
    } catch (error) {
        logger.error(new Error(error.toString()))
        return res.status(500).json({error: "Server Error"})
    }
})

candidateIntroductionRouter.get('/searchintroductionofcollaborator', [authenticate, authorize(['employer']), celebrate(searchCandidateIntroductionOfCollaboratorDto)], async (req: Request, res) => {
    try {
        const condition = {
            keyword: req.query.keyword,
            collaborator_id: req.query.collaborator_id,
            company_ids: req.query.company_ids,
            status: req.query.status,
            introduction_date_from: req.query.introduction_date_from,
            introduction_date_to: req.query.introduction_date_to
        }
        const bearerToken = req.headers.authorization
        const result = await candidateIntroductionService.searchCandidateIntroductionOfCollaborator(bearerToken, condition, parseInt('' + req.query.page_index), parseInt('' + req.query.page_size), parseInt('' + req.query.sort_by))
        if (result.status === 0) {
            return res.status(200).json(result)
        }
        return res.status(400).json(result)
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
})

candidateIntroductionRouter.get('/searchbycollaborator', [authenticate, authorize(['collaborator']), celebrate(searchCandidateIntroductionByCollaboratorDto)], async (req, res) => {
    try {
        const condition = {
            keyword: req.query.keyword, // search theo ten candidate and post title
            company_ids: req.query.company_ids,
            status: req.query.status,
            introduction_date_from: req.query.introduction_date_from,
            introduction_date_to: req.query.introduction_date_to
        }
        const bearerToken = req.headers.authorization

        const result = await candidateIntroductionService.searchCandidateIntroductionForCollaborator(bearerToken, condition, parseInt('' + req.query.page_index), parseInt('' + req.query.page_size), parseInt('' + req.query.sort_by))
        return res.status(200).json(result)
    } catch (error) {
        logger.error(new Error(error.toString()))
        return res.status(500).json({error: "Server Error"})
    }
})

candidateIntroductionRouter.get('/searchtowarranty', [authenticate, authorize(['collaborator']), celebrate(searchCandidateIntroductionToWarrantyDto)], async (req, res) => {
    try {
        const condition = {
            keyword: req.query.keyword,
            postId: req.query.postId
        }
        const bearerToken = req.headers.authorization
        const result = await candidateIntroductionService.searchCandidateIntroductionToWarranty(bearerToken, condition, parseInt('' + req.query.page_index), parseInt('' + req.query.page_size), parseInt('' + req.query.sort_by))
        return res.status(200).json(result)
    } catch (error) {
        logger.error(new Error(error.toString()))
        return res.status(500).json({error: "Server Error"})
    }
})

// coi lai
candidateIntroductionRouter.get('/:id', [authenticate, authorize(['employer', 'collaborator'])], async (req, res) => {
    try {
        const id = req.params.id
        const token = req.headers.authorization
        const result = await candidateIntroductionService.getCandidateDetail(token, id)
        if (result.status === 1) {
            return res.status(400).json(result)
        }
        return res.status(200).json(result)
    } catch (error) {
        logger.error(new Error(error.toString()))
        return res.status(500).json({error: "Server Error"})
    }
})

// candidateIntroductionRouter.put('/:id',[authenticate, authorize(['employer'])], async(req,res)=>{
//     try {
//         const id =req.params.id
//         const token = req.headers.authorization
//          const result = await candidateIntroductionService.getCandidateDetail(token, id)
//          if(result.status === 1){
//             return res.status(400).json(result)
//          }
//          return res.status(200).json(result)
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json(error)
//     }
// })

candidateIntroductionRouter.post('/cancelreferral', [authenticate, authorize(['collaborator']), celebrate(cancelReferDto)], async (req, res) => {
    try {
        const dto = req.body
        const token = req.headers.authorization
        const result = await candidateIntroductionService.cancelRefer(token, dto.candidateIntroductionId, dto.postId, dto.reason)
        if (result.status === 1) {
            return res.status(400).json(result)
        }
        return res.status(200).json(result)
    } catch (error) {
        logger.error(new Error(error.toString()))
        return res.status(500).json({error: "Server Error"})
    }
})
candidateIntroductionRouter.post('/exportrefer', [authenticate, authorize(['collaborator']), celebrate(exportExcelDto)], async (req, res) => {
    try {
        const dataToExport = req.body
        const pathExcel = await candidateIntroductionService.exportToExcel(dataToExport.data)
        return res.download(pathExcel)
    } catch (error) {
        logger.error(new Error(error.toString()))
        return res.status(500).json({error: "Server Error"})
    }
})

candidateIntroductionRouter.post('/updatestatusintroduction', [authenticate, authorize(['employer']), celebrate(updateStatusCandidateIntroduction)], async (req, res) => {
    try {
        const body = req.body
        const bearerToken = req.headers.authorization
        const result = await candidateIntroductionService.updateStatusHistory(bearerToken, body.candidateIntroductionId, body.onboardDate, body.workEndDate, body.note, body.status)
        if (result.status === 0) {
            return res.status(200).json(result)
        }
        return res.status(400).json(result)
    } catch (error) {
        logger.error(new Error(error.toString()))
        return res.status(500).json({error: "Server Error"})
    }
})

candidateIntroductionRouter.post('/warrantycandidate', [authenticate, authorize(['collaborator']), celebrate(warrantyCandidateDto)], async (req, res) => {
    try {
        const body = req.body
        const result = await candidateIntroductionService.chooseCandidateToWarranty(body.guaranteed_candidate_introuduction_id, body.alternative_candidate_introuduction_id)
        if (result.status === 0) {
            return res.status(200).json(result)
        }
        return res.status(400).json(result)
    } catch (error) {
        logger.error(new Error(error.toString()))
        return res.status(500).json({error: "Server Error"})
    }
})

candidateIntroductionRouter.post('/reportforstatistic', [authenticate, authorize(['employer', 'collaborator']), celebrate(searchReportDto)], async (req, res) => {
    try {
        const dto = req.body
        const reportBy = dto.reportBy
        const date = dto.date
        const number = dto.number
        const statuses = dto.statuses
        const token = req.headers.authorization
        const result = await candidateIntroductionService.getReportForStatistic(token, reportBy, date, number, statuses)
        return res.status(200).json(result)
    } catch (error) {
        console.log(error);

        return res.status(500).json(error)
    }
})

candidateIntroductionRouter.post('/reportforposts', [authenticate, authorize(['employer']), celebrate(reportForPostDto)], async (req, res) => {
    try {
        const dto = req.body
        const postIds = dto.post_ids
        const token = req.headers.authorization
        const result = await candidateIntroductionService.getReportForPosts(token, postIds)
        return res.status(200).json(result)
    } catch (error) {
        logger.error(new Error(error.toString()))
        return res.status(500).json({error: "Server Error"})
    }
})

candidateIntroductionRouter.post('/invitetest', [authenticate, authorize(['employer']), celebrate(inviteTestDto)], async (req, res) => {
    try {
        const dto = req.body
        const candidate_introduction_id = dto.candidate_introduction_id
        const email = dto.email
        const question_packages = dto.question_packages
        const invited_at = dto.invited_at
        const expired = dto.expired
        const token = req.headers.authorization
        const result = await candidateIntroductionService.inviteTest(token, candidate_introduction_id, email, question_packages, invited_at, expired)
        if (result.status === 0) {
            return res.status(200).json(result)
        }
        return res.status(400).json(result)
    } catch (error) {
        console.log(error);

        return res.status(500).json(error)
    }
})

candidateIntroductionRouter.post('/reporttest', [authenticate, authorize(['employer', 'collaborator']), celebrate(reportTestDto)], async (req, res) => {
    try {
        const dto = req.body
        const candidate_introduction_id = dto.candidate_introduction_id
        const question_packages = dto.question_packages
        const token = req.headers.authorization
        const result = await candidateIntroductionService.getReportTest(token, candidate_introduction_id, question_packages)
        if (result.status === 0) {
            return res.status(200).json(result)
        }
        return res.status(400).json(result)
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
})
