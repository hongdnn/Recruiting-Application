import { celebrate } from "celebrate"
import { Router } from "express"
import { myContainer } from "../../inversify.config"
import logger from "../../logger/winston"
import { authenticate, authorize } from "../../middlewares/middleware"
import { uploadCompanyImage } from "../../multer"
import { TYPES } from "../../types"
import { createCompany, searchCompanyDto, updateCompany } from "../celebrate/company.dto"
import { ICompanyService } from "../services/company.service"

export const companyRouter = Router()



const companyService: ICompanyService = myContainer.get<ICompanyService>(TYPES.ICompanyService)

companyRouter.get('/', async (req, res) => {
    try {
        const result = await companyService.getAllCompany()
        return res.status(200).json({companies: result})
    } catch (error) {
        logger.error(new Error(error.toString()))
        return res.status(500).json({error: "Server Error"})
    }
})

companyRouter.get('/search',[authenticate, authorize(['employer']), celebrate(searchCompanyDto)], async (req, res) => {
    try {
        const condition = {
            company: req.query.keyword,
            industry_id: req.query.industryId            
        }
        const pageIndex = req.query.pageIndex;
        const pageSize = req.query.pageSize;
        const sortBy = req.query.sortBy
        const result = await companyService.searchCompany(condition, parseInt(''+pageIndex),parseInt(''+pageSize),parseInt(''+sortBy))
        return res.status(200).json(result)
        
        
    } catch (error) {
        logger.error(new Error(error.toString()))
        return res.status(500).json({error: "Server Error"})
    }
})

companyRouter.post('/',[authenticate, authorize(['employer']), celebrate(createCompany)], async (req, res) => {
    try {
        const dto = req.body
        const bearerToken = req.headers.authorization
        const result = await companyService.createCompany(bearerToken,dto)
        if(result.status === 0){
            return res.status(200).json(result)
        }
        return res.status(400).json(result)
        
    } catch (error) {
        logger.error(new Error(error.toString()))
        return res.status(500).json({error: "Server Error"})
    }
})

companyRouter.post('/uploadcompanyimage',[authenticate, authorize(['employer']), uploadCompanyImage], async (req, res) => {
    try{
        const file = req.file
        return res.status(200).json({path : '/static/company_images/'+file.filename})
    }catch(error){
        logger.error(new Error(error.toString()))
        return res.status(500).json({error: "Server Error"})
    }
})

companyRouter.put('/:id',[authenticate, authorize(['employer']), celebrate(updateCompany)], async (req, res) => {
    try {
        const dto = req.body
        const companyId = req.params.id
        const bearerToken = req.headers.authorization
        const result = await companyService.updateCompany(bearerToken,companyId,dto)
        if(result.status === 0){
            return res.status(200).json(result)
        }
        return res.status(400).json(result)
        
    } catch (error) {
        logger.error(new Error(error.toString()))
        return res.status(500).json({error: "Server Error"})
    }
})

companyRouter.delete('/:id',[authenticate, authorize(['employer'])],  async (req, res) => {
    try {
        const companyId = req.params.id
        const bearerToken = req.headers.authorization
        const result = await companyService.removeCompany(bearerToken,companyId)
        if(result.status === 0){
            return res.status(200).json(result)
        }
        return res.status(400).json(result)
        
    } catch (error) {
        logger.error(new Error(error.toString()))
        return res.status(500).json({error: "Server Error"})
    }
})
companyRouter.get('/:id',[authenticate, authorize(['employer'])],  async (req, res) => {
    try {
        const companyId = req.params.id
        const bearerToken = req.headers.authorization
        const result = await companyService.getDetailCompany(bearerToken,companyId)
        if(result.status === 0){
            return res.status(200).json(result)
        }
        return res.status(400).json(result)
        
    } catch (error) {
        logger.error(new Error(error.toString()))
        return res.status(500).json({error: "Server Error"})
    }
})