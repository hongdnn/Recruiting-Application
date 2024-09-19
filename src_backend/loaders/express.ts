import * as express from 'express'
import { userRouter } from '../controllers/routes/user.route'
import { authenticate, authorize } from '../middlewares/middleware'
import cors from 'cors'
import { errors } from 'celebrate'
import { postRouter } from '../controllers/routes/post.route'
import { bankAccountRouter } from '../controllers/routes/bank_account.route'
import { savedPostRouter } from '../controllers/routes/saved_post.route'
import { industryRouter } from '../controllers/routes/industry.route'
import { candidateRouter } from '../controllers/routes/candidate.route'
import { jobRoleRouter } from '../controllers/routes/job_role.route'
import { skillRouter } from '../controllers/routes/skill.route'
import { languageRouter } from '../controllers/routes/language.route'
import { commentRouter } from '../controllers/routes/comment.route'
import { cityRouter } from '../controllers/routes/city.route'
import { interviewScheduleRouter } from '../controllers/routes/interview_schedule.route'
import { companyRouter } from '../controllers/routes/company.route'
import { candidateIntroductionRouter } from '../controllers/routes/candidate_introduction.route'
import { jobRouter } from '../controllers/routes/job.route'
import { functionRouter } from '../controllers/routes/function.route'
import { optionalFieldRouter } from '../controllers/routes/optional_field.route'
import { Constants } from '../common/constants'
import { permissionRouter } from '../controllers/routes/permission.route'
import { scheduleStatusHistoryRouter } from '../controllers/routes/interview_schedule_status_history.route'
import { placementRouter } from '../controllers/routes/placement.route'
import { warrantyRouter } from '../controllers/routes/warranty.route'
import { notificationRouter } from '../controllers/routes/notification.route'

export class ExpressLoader {
    constructor() {

    }

    configExpress(app) {

        app.use('/static/cv', express.static(Constants.pathFixedCv))
        app.use('/static/original_cv', express.static(Constants.pathOriginalCv))
        app.use('/static/tmp_cv', express.static(Constants.pathTmpFixedCv))
        app.use('/static/tmp_original_cv', express.static(Constants.pathTmpOriginalCv))
        app.use('/static/images_tmp', express.static(Constants.pathImagesTmp))
        app.use('/static/images', express.static(Constants.pathImages))
        app.use('/static/bank_account_images', express.static(Constants.pathImagesBank))
        app.use('/static/company_images', express.static(Constants.pathImagesCompany))
        app.use('/static/icons', express.static(Constants.pathIcons))
        app.use('/static/excel', express.static(Constants.pathExcel))
        app.use(express.json())
        app.use(cors())
        //app.use(session(SessionConfig))
        // user
        //tatoolvn_session=YmiJ0h333E2Bz2wjfJW1hUSPVLm638v0N7A9qOfY; expires=Tue, 22-Jun-2021 20:55:46 GMT; Max-Age=7200; path=/; httponly; samesite=lax
        app.use('/users/employer', authenticate, authorize(['employer']))
        app.use('/users/collaborator', authenticate, authorize(['collaborator']))
        app.use('/users/accounts', authenticate, authorize(['collaborator', 'employer']))
        app.use('/users', userRouter) // done route
        //post
        app.use('/posts', postRouter) // done
        // industries
        app.use('/industries', industryRouter)
        // bank account
        app.use('/bankaccounts', bankAccountRouter)
        // saved post
        app.use('/savedposts', authenticate, authorize(['collaborator']), savedPostRouter)
        // candidate
        app.use('/candidates', candidateRouter) // done
        // candidate introduction
        app.use('/candidateintroductions', candidateIntroductionRouter) // done
        // interview schedule
        app.use('/interviewschedules', interviewScheduleRouter) // done
        // job role
        app.use('/jobrole', jobRoleRouter)
        // skill
        app.use('/skills', skillRouter)
        // language
        app.use('/languages', languageRouter)
        // comment
        app.use('/comments', commentRouter)
        // city
        app.use('/cities', cityRouter)
        // company
        app.use('/companies', companyRouter)
        // jobs
        app.use('/jobs', jobRouter)
        // function
        app.use('/functions', functionRouter)
        // optional field
        app.use('/optionalfields', optionalFieldRouter)
        // permission
        app.use('/permissions', authenticate, authorize(['employer']), permissionRouter)
        // interview schedule status history
        //app.use('/schedulestatushistories', authenticate, authorize(['employer']), scheduleStatusHistoryRouter)
        // placments
        app.use('/placements', placementRouter)
        // warranty
        app.use('/warranties', warrantyRouter)
        // notification
        app.use('/notifications', authenticate, authorize(['collaborator', 'employer']), notificationRouter)
        //middleware error
        app.use(errors())

        app.get('/', (req, res) => res.send('Welcome to tatool API'))
    }


}