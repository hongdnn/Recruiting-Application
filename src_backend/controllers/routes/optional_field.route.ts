import { Router } from "express"
import { myContainer } from "../../inversify.config"
import { TYPES } from "../../types"
import { IIndustryService, IndustryService } from "../services/industry.service"
import { IJobRoleService } from "../services/job_role.service"
import { IOptionalFieldService } from "../services/optional_field.service"

export const optionalFieldRouter = Router()



const optionalFieldService: IOptionalFieldService = myContainer.get<IOptionalFieldService>(TYPES.IOptionalFieldService)

optionalFieldRouter.get('/post/:id', async (req, res) => {
    try {
        const postId = req.params.id
        const result = await optionalFieldService.getOptionalFieldsByPostId(postId)
        if(result.status === 0){
            return res.status(200).json(result)
        }
        return res.status(400).json(result)
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
        
    }
   
})