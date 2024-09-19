import { Router } from "express"
import { myContainer } from "../../inversify.config"
import { TYPES } from "../../types"
import { ISkillService } from "../services/skill.service"

export const skillRouter = Router()



const skillService: ISkillService = myContainer.get<ISkillService>(TYPES.ISkillService)

skillRouter.get('/', async (req, res) => {
    try {
        const result = await skillService.getAllSkill()
        return res.status(200).json({skills: result})
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
})