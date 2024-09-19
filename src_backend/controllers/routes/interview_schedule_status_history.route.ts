import { celebrate } from "celebrate"
import { Router } from "express"
import { myContainer } from "../../inversify.config"
import { authenticate, authorize } from "../../middlewares/middleware"
import { TYPES } from "../../types"
import { updateScheduleStatusHistory } from "../celebrate/interview_schedule_status_history.dto"
import { IInterviewScheduleStatusHistoryService } from "../services/interview_schedule_status_history.service"

export const scheduleStatusHistoryRouter = Router()



const scheduleStatusHistoryService: IInterviewScheduleStatusHistoryService = myContainer.get<IInterviewScheduleStatusHistoryService>(TYPES.IInterviewScheduleStatusHistoryService)


scheduleStatusHistoryRouter.put('/:id',  celebrate(updateScheduleStatusHistory), async (req, res) => {
    try {
        const token = req.headers.authorization
        const id = req.params.id
        const dto = req.body
        const result = await scheduleStatusHistoryService.updateStatusHistory(token, id, dto)
        return res.status(200).json(result)
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
})