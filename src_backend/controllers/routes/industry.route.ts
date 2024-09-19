import { Router } from "express"
import { myContainer } from "../../inversify.config"
import { TYPES } from "../../types"
import { IIndustryService, IndustryService } from "../services/industry.service"

export const industryRouter = Router()



const industryService: IIndustryService = myContainer.get<IIndustryService>(TYPES.IIndustryService)

industryRouter.get('/', async (req, res) => {
    try {
        const result = await industryService.getIndustries()
        return res.status(200).json({industries: result})
    } catch (error) {
        return res.status(500).json(error)
    }
})

industryRouter.get('/industriesforpost', async (req, res) => {
    try {
        const result = await industryService.getListIndustries()
        return res.status(200).json({industries: result})
    } catch (error) {
        return res.status(500).json(error)
    }
})