import { celebrate } from "celebrate"
import { Router } from "express"
import { myContainer } from "../../inversify.config"
import { authenticate, authorize } from "../../middlewares/middleware"
import { TYPES } from "../../types"
import { createWarrantyDto } from "../celebrate/warranty.dto"
import { IWarrantyService } from "../services/warranty.service"

export const warrantyRouter = Router()



const warrantyService: IWarrantyService = myContainer.get<IWarrantyService>(TYPES.IWarrantyService)

warrantyRouter.post('/',[authenticate,authorize(['employer']), celebrate(createWarrantyDto)], async (req, res) => {
    try {
        const dto = req.body
        const bearerToken = req.headers.authorization
        const result = await warrantyService.createWarranty(bearerToken,dto)
        if(result.status === 0){
            return res.status(200).json(result)
        }
        return res.status(400).json(result)
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
})