import { Router } from "express"
import { myContainer } from "../../inversify.config"
import { TYPES } from "../../types"
import { IJobService } from "../services/job.service"

export const jobRouter = Router()



const jobService: IJobService = myContainer.get<IJobService>(TYPES.IJobService)

jobRouter.get('/', async (req, res) => {
    try {
        const result = await jobService.getJobs()
        return res.status(200).json({jobs: result})
    } catch (error) {
        return res.status(500).json(error)
    }
})

jobRouter.get('/getjobsbyfunction/:id', async (req, res) => {
    try {
        const functionId = req.params.id
        const result = await jobService.getJobsByFunction(functionId)
        return res.status(200).json({jobs: result})
    } catch (error) {
        return res.status(500).json(error)
    }
})