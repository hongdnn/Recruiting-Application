/**
 * Required External Modules and Interfaces
 */
 import { Router } from 'express'
 import { TYPES } from '../../types'
 import { myContainer } from '../../inversify.config';
 import {celebrate} from 'celebrate'
import { IBankAccountService } from '../services/bank_account.service';
import { updateBankAccount } from '../celebrate/bank_account.dto';
import { uploadBankImage } from '../../multer';
import { authenticate, authorize } from '../../middlewares/middleware';
 
 /**
  * Router Definition
  */
 
 export const bankAccountRouter = Router()
 
 
 
 const bankAccountService: IBankAccountService = myContainer.get<IBankAccountService>(TYPES.IBankAccountService)

 bankAccountRouter.post('/uploadimage', [authenticate, authorize(['collaborator']), uploadBankImage], async (req, res) => {
    try {
        const files = req.files
        let result = {}
        if (files !== undefined) {
            var fileKeys = Object.keys(files)
            for (const key of fileKeys) {
                const filePath = `/static/bank_account_images/${files[key][0].filename}`
                if(key === 'front_side_image'){
                    result['front_side_image'] = filePath
                }else if(key === 'back_side_image'){
                    result['back_side_image'] = filePath
                }
            }
        }
        return res.status(200).json(result)
    } catch (error) {
        return res.status(500).json({ error })
    }
})

bankAccountRouter.post('/',[authenticate, authorize(['collaborator']), celebrate(updateBankAccount)], async(req,res)=>{
    try {
        const updateFields= req.body
        const result = await bankAccountService.updateBankAccount(updateFields)
        if(result.status === 1){
            return res.status(400).json({message: 'This account is not existed.'})
        }
        return res.status(200).json(result)
    } catch (error) {
        return res.status(500).json({ error })
    }
})
 
 