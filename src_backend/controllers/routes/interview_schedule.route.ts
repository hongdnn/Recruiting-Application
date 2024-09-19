import { celebrate } from "celebrate"
import { Router } from "express"
import { myContainer } from "../../inversify.config"
import { authenticate, authorize } from "../../middlewares/middleware"
import { TYPES } from "../../types"
import { createInterviewSchedule, searchInterviewSchedule, updateInterviewSchedule, updateScheduleQuestions, updateScheduleStatus } from "../celebrate/interview_schedule.dto"
import { IInterviewScheduleService } from "../services/interview_schedule.service"

export const interviewScheduleRouter = Router()



const itvScheduleService: IInterviewScheduleService = myContainer.get<IInterviewScheduleService>(TYPES.IInterviewScheduleService)


interviewScheduleRouter.get('/', [authenticate, authorize(['employer', 'collaborator']), celebrate(searchInterviewSchedule)], async (req, res) => {
    try {
        const token = req.headers.authorization
        let condition = {
            keyword: req.query.keyword,
            company_id: req.query.company_id,
            status: req.query.status
        }
        const result = await itvScheduleService.searchInterviewSchedule(token, condition, parseInt('' + req.query.page_index),
            parseInt('' + req.query.page_size), parseInt('' + req.query.sort_by))
        if (result.status !== 0) {
            return res.status(400).json(result)
        }
        return res.status(200).json(result)
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
})

interviewScheduleRouter.post('/', [authenticate, authorize(['employer']), celebrate(createInterviewSchedule)], async (req, res) => {
    try {
        const dto = req.body
        const google_meet = dto.google_meet
        delete dto.google_meet
        const token = req.headers.authorization
        const result = await itvScheduleService.createInterviewSchedule(token, dto, google_meet)
        if (result.status !== 0) {
            return res.status(400).json(result)
        }
        return res.status(200).json(result)
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
})

interviewScheduleRouter.put('/:id', [authenticate, authorize(['employer']), celebrate(updateInterviewSchedule)], async (req, res) => {
    try {
        const id = req.params.id
        const dto = req.body
        const google_meet = dto.google_meet
        delete dto.google_meet
        const token = req.headers.authorization
        const result = await itvScheduleService.updateInterviewSchedule(token, id, dto, google_meet)
        if (result.status !== 0) {
            return res.status(400).json(result)
        }
        return res.status(200).json(result)
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
})

interviewScheduleRouter.put('/status/:id', [authenticate, authorize(['employer']), celebrate(updateScheduleStatus)], async (req, res) => {
    try {
        const id = req.params.id
        const dto = req.body
        const token = req.headers.authorization
        const result = await itvScheduleService.updateScheduleStatus(token, id, dto)
        if (result.status !== 0) {
            return res.status(400).json(result)
        }
        return res.status(200).json(result)
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
})

interviewScheduleRouter.get('/:id', [authenticate, authorize(['employer', 'collaborator'])], async (req, res) => {
    try {
        const token = req.headers.authorization
        const id = req.params.id
        const result = await itvScheduleService.getScheduleDetail(token, id)
        if (result.status === 1) {
            return res.status(400).json(result)
        }
        return res.status(200).json(result)
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
})

interviewScheduleRouter.post('/questions/:id', celebrate(updateScheduleQuestions), async (req, res) => {
    try {
        const token = req.headers.authorization
        const id = req.params.id
        const dto = req.body.questions
        const result = await itvScheduleService.updateScheduleQuestions(token, id, dto)
        if (result.status !== 0) {
            return res.status(400).json(result)
        }
        return res.status(200).json(result)
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
})