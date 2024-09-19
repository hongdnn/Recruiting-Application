/**
 * Required External Modules and Interfaces
 */
import { Request, Response, Router } from 'express'
import { TYPES } from '../../types'
import { myContainer } from '../../inversify.config';
import { IUserService } from '../services/user.service';
import { celebrate } from 'celebrate'
import { changePasswordDto, createEmployerDto, createUserDto, forgotPasswordDto, loginDto, loginSocialAccountDto, resetPasswordDto, searchCollaboratorDto, searchStaffDto, updateCollabDto, updateEmployerDto, updateFCMDto, updateStatusCollaboratorByEmployer } from '../celebrate/user.dto'
import { uploadUserImage } from '../../multer'
import { authenticate, authorize } from '../../middlewares/middleware';


/**
 * Router Definition
 */

export const userRouter = Router()



const userService: IUserService = myContainer.get<IUserService>(TYPES.IUserService)


/**
 * Controller Definitions
 */

// collab and admin

userRouter.post('/', celebrate(createUserDto), async (req: Request, res: Response) => {
    try {
        const dto = req.body
        const result = await userService.registerUser(dto)
        if (!result) {
            return res.status(400).json({ message: "This email is exsited." })
        }
        return res.status(200).json()
    } catch (error) {
        return res.status(500).json({ errors: error.errors })
    }
})

userRouter.get('/confirm-user/:email/:verifyCode', async (req: Request, res: Response) => {
    try {
        const email = req.params.email
        const verifyCode = req.params.verifyCode
        const result = await userService.confirmUser(email, verifyCode);
        if (result.status === 0) {
            return res.status(200).json(result)
        }
        return res.status(400).json(result)
    } catch (error) {
        return res.status(500).json({ error })
    }
})

userRouter.post('/forgot-password', celebrate(forgotPasswordDto), async (req: Request, res: Response) => {
    try {
        const body = req.body
        const result = await userService.forgotPassword(body.email)
        if (result.status === 0) {
            return res.status(200).json(result)
        }
        return res.status(400).json(result)
    } catch (error) {
        return res.status(500).json({ error })
    }
})

/// http://localhost:3000/users/reset-password/:email/:verifyCode
userRouter.post('/reset-password', celebrate(resetPasswordDto), async (req: Request, res: Response) => {
    try {
        const dto = req.body
        const result = await userService.confirmResetPassword(dto.email, dto.password, dto.verification_code);
        if (result.status === 0) {
            return res.status(200).json(result)
        }
        return res.status(400).json(result)
    } catch (error) {
        return res.status(500).json({ error })
    }
})

userRouter.post('/login', celebrate(loginDto), async (req: Request, res: Response) => {
    try {
        //console.log(req.session.id); // sessionId để check xem cái sessionId này có thuộc về hệ thống mình không (trong sessionId có key được mã hóa )
        // các hàm cần login thì khi login xong gán cái userId vô session nếu trong obj session có userId có nghĩa là đã login 

        const dto = req.body
        const resultLogin = await userService.login(dto.email, dto.password)
        if (resultLogin.status === 0) {
            return res.status(200).json(resultLogin)
        }
        return res.status(400).json(resultLogin)
    } catch (error) {
        console.log(error);
        return res.status(500).json({ errors: error.errors })
    }
})


// collab 
userRouter.put('/collaborator/:id', celebrate(updateCollabDto), async (req, res) => {
    try {
        const dto = req.body
        const id = req.params.id
        const result = await userService.updateCollaborator(id, dto)
        if (result.status === 1) {
            return res.status(400).json(result)
        }
        return res.status(200).json(result)
    } catch (error) {
        return res.status(500).json({ error })
    }
})

// employer 
userRouter.put('/employer/:id', celebrate(updateEmployerDto), async (req, res) => {
    try {
        const bearToken = req.headers.authorization;
        const dto = req.body
        const id = req.params.id
        const result = await userService.updateEmployer(bearToken, id, dto)
        if (result.status === 1) {
            return res.status(400).json(result)
        }
        return res.status(200).json(result)
    } catch (error) {
        return res.status(500).json({ error })
    }
})


userRouter.put('/accounts/changepassword', [celebrate(changePasswordDto)], async (req: Request, res: Response) => {
    try {
        const dto = req.body
        const bearerToken = req.headers.authorization
        const result = await userService.changePassword(bearerToken, dto.re_password, dto.old_password, dto.new_password)
        if (result.status === 0) {
            return res.status(200).json(result)
        }
        return res.status(400).json(result)
    } catch (error) {
        // logger.error(error)
        return res.status(500).json({ error })
    }
})

userRouter.post('/employer', celebrate(createEmployerDto), async (req, res) => {
    try {
        const bearToken = req.headers.authorization;
        const dto = req.body
        var result = await userService.createStaff(bearToken, dto)
        if (result.status === 1) {
            return res.status(400).json(result)
        }
        return res.status(200).json(result)
    } catch (error) {
        return res.status(500).json({ error })
    }
})

userRouter.post('/accounts/uploadimage', uploadUserImage, async (req, res) => {
    try {
        const file = req.file
        const filePath = `/static/images/${file.filename}`
        return res.status(200).json({ image: filePath })
    } catch (error) {
        return res.status(500).json({ error })
    }
})

//collab
userRouter.get('/collaborator/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const result = await userService.getCollaborator(id);
        if (result.status === 0) {
            return res.status(200).json(result)
        }
        return res.status(400).json(result)
    } catch (error) {
        return res.status(500).json({ error })
    }
})

// get candidate detail for employer
userRouter.get('/getcollaboratorforemployer/:id', [authenticate, authorize(['employer'])], async (req, res) => {
    try {
        const bearToken = req.headers.authorization;
        const id = req.params.id;
        const result = await userService.getCollaboratorForEmployer(bearToken, id);
        if (result.status === 0) {
            return res.status(200).json(result)
        }
        return res.status(400).json(result)
    } catch (error) {
        return res.status(500).json({ error })
    }
})

userRouter.get('/employer/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const result = await userService.getEmployer(id);
        if (result.status === 0) {
            return res.status(200).json(result)
        }
        return res.status(400).json(result)
    } catch (error) {
        return res.status(500).json({ error })
    }
})



userRouter.put('/accounts/fcmtoken', [celebrate(updateFCMDto)], async (req, res) => {
    try {
        const bearToken = req.headers.authorization;
        const dto = req.body
        const result = await userService.updateFCMToken(bearToken, dto);
        if (result.status === 0) {
            return res.status(200).json(result)
        }
        return res.status(400).json(result)
    } catch (error) {
        return res.status(500).json({ error })
    }
})


userRouter.post('/loginsocialaccount', celebrate(loginSocialAccountDto), async (req: Request, res: Response) => {
    try {
        const dto = req.body
        const createdUser = await userService.loginBySocialAccount(dto)
        if (createdUser.status === 0) {
            return res.status(200).json(createdUser)
        }
        return res.status(400).json(createdUser)
    } catch (error) {
        console.log(error);
        return res.status(500).json({ errors: error.errors })
    }
})


userRouter.get('/employer', celebrate(searchStaffDto), async (req, res) => {
    try {
        const bearToken = req.headers.authorization;
        let condition = {
            keyword: req.query.keyword,
            status: req.query.status
        }
        const sortBy = req.query.sortBy
        const result = await userService.searchStaff(bearToken, condition, parseInt('' + req.query.page_index), parseInt('' + req.query.page_size), parseInt('' + sortBy))
        if (result.status === 1) {
            return res.status(400).json(result)
        }
        return res.status(200).json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
})

userRouter.get('/employers', async (req, res) => {
    try {
        const result = await userService.getAllEmployer()
        return res.status(200).json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
})

userRouter.get('/collaborators',[authenticate, authorize(['employer']), celebrate(searchCollaboratorDto)], async (req, res) => {
    try {
        const condition = {
            keyword: req.query.keyword,
            status: req.query.status
        
        }
        const sortBy = parseInt('' + req.query.sortBy)
        const pageIndex =  parseInt('' + req.query.pageIndex)
        const pageSize =  parseInt('' + req.query.pageSize)
        const bearerToken = req.headers.authorization
        const result = await userService.searchCollaboratorByEmployer(bearerToken,condition,pageIndex,pageSize,sortBy)
        if(result.status === 0){
            return res.status(200).json(result);
        }
        return res.status(400).json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
})

userRouter.post('/updatestatuscollaborator',[authenticate,authorize(['employer']),celebrate(updateStatusCollaboratorByEmployer)], async (req: Request, res: Response) => {
    try {
        const collaboratorId = req.body.collaboratorId
        const status = req.body.status
        const bearerToken = req.headers.authorization
        const result = await userService.updateStatusCollaborator(bearerToken,collaboratorId, status)
        if (result.status === 0) {
            return res.status(200).json(result)
        }
        return res.status(400).json(result)
    } catch (error) {
        console.log(error);
        return res.status(500).json({ errors: "Server error"})
    }
})