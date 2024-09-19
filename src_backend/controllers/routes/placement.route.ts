import { celebrate } from "celebrate"
import { Request, Response, Router } from "express"
import { myContainer } from "../../inversify.config"
import { authenticate, authorize } from "../../middlewares/middleware"
import { TYPES } from "../../types"
import { createPlacementDto, searchPlacementbyCollaboratorDto,searchPlacementByEmployerDto, updateStatusDto } from "../celebrate/placement.dto"
import { IPlacementService } from "../services/placement.service"

export const placementRouter = Router()



const placementService: IPlacementService = myContainer.get<IPlacementService>(TYPES.IPlacementService)

placementRouter.get('/searchbycollaborator',[authenticate, authorize(['collaborator']), celebrate(searchPlacementbyCollaboratorDto)], async (req, res) => {
    try {
       const condition = {
           keyword: req.query.keyword,
           companyIds: req.query.companyIds, 
           payment_status: req.query.paymentStatus // 0 la all
        }
        const pageIndex = parseInt(''+req.query.pageIndex)
        const pageSize = parseInt(''+req.query.pageSize)
        const sortBy = parseInt(''+req.query.sortBy)
        const bearerToken = req.headers.authorization
        const result  = await placementService.searchPlacementForCollaborator(bearerToken, condition,pageIndex,pageSize,sortBy)
        return res.status(200).json(result)
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
})

placementRouter.get('/searchbyemployer',[authenticate, authorize(['employer']), celebrate(searchPlacementByEmployerDto)], async (req, res) => {
    try {
        const condition = {
           keyword: req.query.keyword,
           companyIds: req.query.companyIds, 
           payment_status: req.query.paymentStatus, // 0 la all
           collaborator_id: req.query.collaborator_id
        }
        const pageIndex = parseInt(''+req.query.pageIndex)
        const pageSize = parseInt(''+req.query.pageSize)
        const sortBy = parseInt(''+req.query.sortBy)
        const bearerToken = req.headers.authorization
        const result  = await placementService.searchPlacementForEmployer(bearerToken, condition,pageIndex,pageSize,sortBy)
        if(result.status === 0){
            return res.status(200).json(result)
        }
        return res.status(400).json(result)
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
})

placementRouter.get('/detail/:id',[authenticate, authorize(['employer', 'collaborator'])], async (req, res) => {
    try {
        const id = req.params.id
        const bearerToken = req.headers.authorization
        const result  = await placementService.viewDetailPlacement(bearerToken, id)
        if(result.status === 0){
            return res.status(200).json(result)
        }
        return res.status(400).json(result)
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
})

placementRouter.post('/',[authenticate, authorize(['employer']), celebrate(createPlacementDto)], async (req, res) => {
    try {
        const dto = req.body
        const bearerToken = req.headers.authorization
        const result  = await placementService.createPlacement(bearerToken,dto)
        if(result.status === 0){
            return res.status(200).json(result)
        }
        return res.status(400).json(result)
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
})

placementRouter.post('/updatestatus',[authenticate, authorize(['employer']), celebrate(updateStatusDto)], async (req, res) => {
    try {
        const placementId = req.body.placementId
        const status = req.body.status
        const bearerToken = req.headers.authorization
        const result = await placementService.updateStatusPlacement(bearerToken,placementId, status)
        if(result.status === 0){
            return res.status(200).json(result)
        }
        return res.status(400).json(result)
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
})

placementRouter.get('/placementpreview/candidateintroduction/:id',[authenticate, authorize(['employer'])], async(req,res)=>{
    try {
        const id = req.params.id
        const bearerToken = req.headers.authorization
        const result = await placementService.viewDetailBeforeCreatePlacement(bearerToken,id)
        if(result.status === 0){
            return res.status(200).json(result)
        }
        return res.status(400).json(result)
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
})

placementRouter.get('/placementhistoryofcollaborator/:id',[authenticate, authorize(['employer'])], async(req,res)=>{
    try {
        const id = req.params.id
        const bearerToken = req.headers.authorization
        const result = await placementService.viewPlacementHistoryOfCollaborator(bearerToken,id)
        if(result.status === 0){
            return res.status(200).json(result)
        }
        return res.status(400).json(result)
        
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
})
