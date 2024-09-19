import { Router } from "express"
import { myContainer } from "../../inversify.config"
import { TYPES } from "../../types"
import { IPermissionService } from "../services/permission.service"

export const permissionRouter = Router()



const permissionService: IPermissionService = myContainer.get<IPermissionService>(TYPES.IPermissionService)

permissionRouter.get('/', async (req, res) => {
    try {
        const result = await permissionService.getAllPermissions()
        return res.status(200).json(result)
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
})