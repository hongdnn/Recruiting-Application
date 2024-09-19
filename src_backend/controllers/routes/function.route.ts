import { Router } from "express"
import { myContainer } from "../../inversify.config"
import { TYPES } from "../../types"
import { IFunctionService } from "../services/function.service"

export const functionRouter = Router()



const functionService: IFunctionService = myContainer.get<IFunctionService>(TYPES.IFunctionService)

functionRouter.get('/', async (req, res) => {
    try {
        const result = await functionService.getFunctions()
        return res.status(200).json({functions: result})
    } catch (error) {
        return res.status(500).json(error)
    }
})
functionRouter.get('/getfunctionsbyindustry/:id', async (req, res) => {
    try {
        const industryId = req.params.id
        const result = await functionService.getFunctionsByIndustry(industryId)
        return res.status(200).json({functions: result})
    } catch (error) {
        return res.status(500).json(error)
    }
})