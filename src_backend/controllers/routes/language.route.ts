import { Router } from "express"
import { myContainer } from "../../inversify.config"
import { TYPES } from "../../types"
import { ILanguageService } from "../services/language.service"

export const languageRouter = Router()



const languageService: ILanguageService = myContainer.get<ILanguageService>(TYPES.ILanguageService)

languageRouter.get('/', async (req, res) => {
    try {
        const result = await languageService.getAllLanguage()
        return res.status(200).json({languages: result})
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
})