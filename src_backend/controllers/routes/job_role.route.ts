import { Router } from "express"
import { myContainer } from "../../inversify.config"
import { TYPES } from "../../types"
import { IIndustryService, IndustryService } from "../services/industry.service"
import { IJobRoleService } from "../services/job_role.service"

export const jobRoleRouter = Router()



const jobRoleService: IJobRoleService = myContainer.get<IJobRoleService>(TYPES.IJobRoleService)

jobRoleRouter.get('/', async (req, res) => {
    try {
        const result = await jobRoleService.getAllJobRole()
        return res.status(200).json({job_role: result})
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
        
    }
   
})

jobRoleRouter.get('/getjobrolesbyfunction/:id', async (req, res) => {
    try {
        const functionId = req.params.id
        const result = await jobRoleService.getJobRolesByFunction(functionId)
        return res.status(200).json({job_role: result})
    } catch (error) {
        return res.status(500).json(error)
    }
   
})