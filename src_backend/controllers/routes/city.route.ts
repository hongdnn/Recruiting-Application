import { Router } from "express"
import { myContainer } from "../../inversify.config"
import { TYPES } from "../../types"
import { ICityService } from "../services/city.service"

export const cityRouter = Router()



const cityService: ICityService = myContainer.get<ICityService>(TYPES.ICityService)

cityRouter.get('/', async (req, res) => {
    try {
        const result = await cityService.getAllCities()
        return res.status(200).json({cities: result})
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
})