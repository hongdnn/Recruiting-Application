import { TYPES } from '../../types'
import { injectable, inject } from 'inversify'
import { Token } from '../../JwtToken/JwtToken'
import { IUserRepository } from '../../repositories/user.repository'
import { Staff, User } from '../../entities/user'
import bcrypt from 'bcryptjs'
import { Bcrypt } from '../../environment'
import { IPostRepository } from '../../repositories/post.repository'
import uniqid from 'uniqid'
import { IJobRoleRepository } from '../../repositories/job_role.repository'
import { IIndustryRepository } from '../../repositories/industry.repository'
import { ISkillRepository } from '../../repositories/skill.repository'
import { ILanguageRepository } from '../../repositories/language.repository'
import { CollaboratorStatus, Constants, NotifyIconUrl, NotifyType, TAtatoolUrl } from '../../common/constants'
import { ICityRepository } from '../../repositories/city.repository'
import { IFileRepository } from '../../repositories/file.repository'
import { IBankAccountRepository } from '../../repositories/bank_account.repository'
import { MailService } from '../../mail.service'
import { IPermissionRepository } from '../../repositories/permission.repository'
import { Notification } from '../../entities/notification'
import { INotificationRepository } from '../../repositories/notification.repository'
import { sendNotification } from '../../firebase'
import fs from 'fs'
import { File } from '../../entities/file'
import { ICandidateRepository } from '../../repositories/candidate.repository'
import { ICandidateIntroductionRepository } from '../../repositories/candidate_introduction.repository'



export interface IUserService {
    confirmResetPassword(email: string, newPassword: string, verificationCode: string): Promise<{ message: string, status: number }>
    forgotPassword(email: string): Promise<{ message: string, status: number }>
    updateFCMToken(bearToken: string, updateFields: {}): Promise<{ message: string, status: number }>
    confirmUser(email: string, verifyCode: string): Promise<{ data: {}, token: string, status: number, message: string }>
    registerUser(user: User): Promise<boolean>
    login(email: string, password: string): Promise<{ data: {}, token: string, status: number, message: string }>
    loginBySocialAccount(data: {}): Promise<{ data: {}, token: string, status: number, message: string }>
    changePassword(bearerToken: string, rePasword: string, oldPassword: string, newPassword: string): Promise<{ message: string, status: number }>
    updateCollaborator(id: string, updateFields: {}): Promise<{ data: any, message: string, status: number }>
    updateEmployer(token: string, id: string, updateFields: {}): Promise<{ data: any, message: string, status: number }>
    getCollaborator(id: string): Promise<{ data: {}, message: string, status: number }>
    getCollaboratorForEmployer(token: string, id: string): Promise<{ data: {}, message: string, status: number }>
    getEmployer(id: string): Promise<{ data: {}, message: string, status: number }>
    getAllEmployer(): Promise<{ employers: any[], message: string, status: number }>
    createStaff(token: string, dto: any): Promise<{ data: string | null, message: string, status: number }>
    searchStaff(token: string, condition, pageIndex: number, pageSize: number, sortBy: number): Promise<{
        pageIndex: number,
        pageSize: number,
        totalPages: number,
        totalCount: number,
        data: any[],
        message: string,
        status: number
    }>
    updateStatusCollaborator(bearerToken: string, collaboratorId: string, statusNumber: string) :Promise<{message: string, status: number}>
    searchCollaboratorByEmployer(bearerToken: string, condition, pageIndex: number, pageSize: number, sortBy: number): Promise<{ 
        pageIndex: number,
        pageSize: number,
        totalPages: number,
        totalCount: number,
        collaborators: any[],
        message: string,
        status: number
    }>
}

@injectable()
export class UserService implements IUserService {
    @inject(TYPES.IUserRepository) private readonly _userRepo: IUserRepository
    @inject(TYPES.Token) private readonly _jwtToken: Token
    @inject(TYPES.ICandidateRepository) private readonly _candidateRepo: ICandidateRepository
    @inject(TYPES.ICandidateIntroductionRepository) private readonly _candidateIntroductionRepo: ICandidateIntroductionRepository
    @inject(TYPES.IJobRoleRepository) private readonly _jobRoleRepo: IJobRoleRepository
    @inject(TYPES.IIndustryRepository) private readonly _industryRepo: IIndustryRepository
    @inject(TYPES.ISkillRepository) private readonly _skillRepo: ISkillRepository
    @inject(TYPES.ILanguageRepository) private readonly _languageRepo: ILanguageRepository
    @inject(TYPES.ICityRepository) private readonly _cityRepo: ICityRepository
    @inject(TYPES.IFileRepository) private readonly _fileRepo: IFileRepository
    @inject(TYPES.IBankAccountRepository) private readonly _bankRepo: IBankAccountRepository
    @inject(TYPES.MailService) private readonly _mailService: MailService
    @inject(TYPES.IPermissionRepository) private readonly _permissionRepo: IPermissionRepository
    @inject(TYPES.INotificationRepository) private readonly _notifyRepo: INotificationRepository

    public async confirmResetPassword(email: string, newPassword: string, verificationCode: string): Promise<{ message: string, status: number }> {
        const user = await this._userRepo.getUserByEmail(email)
        if (user !== null) {
            if (user.verification_code === verificationCode) {
                const passwordHash = await bcrypt.hash(newPassword, Bcrypt.SaltRound)
                await this._userRepo.update(user._id, { password: passwordHash, verification_code: null })
                return { message: 'Success', status: 0 }
            }
            return { message: 'Wrong verification code', status: 1 }
        }
        return { message: 'The email is not exsited', status: 2 }
    }

    public async forgotPassword(email: string): Promise<{ message: string, status: number }> {
        const user = await this._userRepo.getUserByEmail(email)
        if (user !== null) {
            if (user.status === "approval") {
                const verificationCode = uniqid()
                const updateField = {
                    verification_code: verificationCode
                }
                // send mail
                const content = 'https://ta.tatool.vn/reset-password?code=' + verificationCode + '&email=' + email
                const result = await this._mailService.sendMail('admin@tatool.vn', email, [], 'Reset password', content, 'Nguyen Duc Hiep')
                await this._userRepo.update(user._id, updateField)
                return { message: 'Success', status: 0 }
            }
            return { message: 'This account is invailable', status: 1 }
        }
        return { message: 'The email is not exsited', status: 2 }

    }

    public async confirmUser(email: string, verifyCode: string): Promise<{ data: {}, token: string, status: number, message: string }> {
        const user = await this._userRepo.getUserByEmail(email);
        if (user !== null) {
            if (user.verification_code === verifyCode) {
                const updateUserResult = await this._userRepo.update(user._id, { status: 'approval', verification_code: null })
                if (updateUserResult !== null) {
                    const permissions = user.permission_ids
                    let permissionsAvailable = []
                    for (let per of permissions) {
                        const permission = await this._permissionRepo.getById(per)
                        if (permission !== null && !permission.is_disable) {
                            permissionsAvailable.push(permission.permission)
                        }
                    }
                    const token = await this._jwtToken.generateToken(user.email, user.first_name + ' ' + user.last_name, user.type_account, user._id, permissionsAvailable, user.status)
                    const responseUser = {
                        id: user._id,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        type_account: user.type_account,
                        email: user.email
                    };
                    return { data: responseUser, token, status: 0, message: 'Success' }
                }
                return { data: {}, token: '', status: 2, message: 'This email is not existed.' }
            }
            return { data: {}, token: '', status: 1, message: 'Verification code is wrong.' }
        }
        return { data: {}, token: '', status: 2, message: 'This email is not existed.' }
    }

    public async registerUser(user: User): Promise<boolean> {
        user.status = 'invisible'
        const passwordHash = await bcrypt.hash(user.password, Bcrypt.SaltRound)
        const checkExsitedUser = await this._userRepo.getUserByEmail(user.email);
        if (checkExsitedUser === null) {
            user.password = passwordHash
            const verificationCode = uniqid()
            user.verification_code = verificationCode
            await this._userRepo.create(user)

            let link = "https://ta.tatool.vn/verify-account?code=" + verificationCode + '&email=' + user.email
            const result = await this._mailService.sendMail('admin@tatool.vn', user.email, [], 'Welcome to tatool', '<html><p>Welcome to tatool</p><br/><p>' + link + '</p></html>', 'Nguyen Duc Hiep')

            return true;
        }
        return false;

    }
    public async login(email: string, password: string): Promise<{ data: {}, token: string, status: number, message: string }> { // done
        const user = await this._userRepo.getUserByEmail(email)
        if (user !== null) {
            const match = await bcrypt.compare(password, user.password);

            if (match === false) {

                return { data: {}, token: '', status: 1, message: 'Email or password maybe incorrect' }
            }
            if(user.type_account === 'collaborator' && user.status !== CollaboratorStatus.APPROVAL && user.status !== CollaboratorStatus.LOCK){
                return { data: {}, token: '', status: 2, message: 'The account is not available' }
            } 
            
            //  else if (user.status === 'invisible') {
            //     return { data: {}, token: '', status: 2, message: 'This status account was invisible' }
            // }
            else {
                let permissions = user.permission_ids
                let permissionsAvailable = []
                for (let per of permissions) {
                    const permission = await this._permissionRepo.getById(per)
                    if (permission !== null && !permission.is_disable) {
                        permissionsAvailable.push(permission.permission)
                    }
                }
                let image = null
                if (user.image_id !== null) {
                    const imageFile = await this._fileRepo.getById(user.image_id)
                    if (imageFile !== null) {
                        image = '/static/images/' + imageFile.name
                    }
                }
                const token = await this._jwtToken.generateToken(user.email, user.first_name + ' ' + user.last_name, user.type_account, user._id, permissionsAvailable, user.status)
                const responseUser = {
                    id: user._id.toString(),
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    image,
                    type_account: user.type_account
                };
                return { data: responseUser, token, status: 0, message: 'Success' }
            }
        }
        return { data: {}, token: '', status: 1, message: 'Email or password maybe incorrect' }
    }

    public async changePassword(bearerToken: string, rePasword: string, oldPassword: string, newPassword: string): Promise<{ message: string, status: number }> {
        const userInfo = this._jwtToken.getUserInfo(bearerToken)
        if (rePasword === newPassword) {
            const user = await this._userRepo.getById(userInfo.id)
            if (user.status === 'approval') {
                const match = await bcrypt.compare(oldPassword, user.password);
                if (match) {
                    const passwordHash = await bcrypt.hash(newPassword, Bcrypt.SaltRound)
                    const result = this._userRepo.update(userInfo.id, { password: passwordHash })
                    if (result) {
                        return { message: 'Update successed.', status: 0 } // ok
                    }
                } else {
                    return { message: 'Old password is not correct.', status: 1 } // password sai 
                }
            } else {
                return { message: 'This account is not approval.', status: 2 } // 
            }
        }
        return { message: 'Re-password and new password are not match.', status: 3 } // re-password ko giong new password

    }

    public async updateCollaborator(id: string, updateFields: {}): Promise<{ data: any, message: string, status: number }> {
        const result = await this._userRepo.getById(id);
        if (result.type_account === 'collaborator') {
            const user = new User(updateFields)
            if (user.job_levels !== undefined && user.job_levels !== null) {
                var jobLevels = user.job_levels.split(";")
                for (i = 0; i < jobLevels.length; i++) {
                    if (!Constants.jobLevel.includes(jobLevels[i])) {
                        return { data: null, message: "job_levels not found", status: 1 }
                    }
                }
            }
            if (user.job_role_ids !== undefined) {
                for (var i = 0; i < user.job_role_ids.length; i++) {
                    const jobRole = await this._jobRoleRepo.getById(user.job_role_ids[i])
                    if (jobRole === null || jobRole !== null && jobRole.status !== "publish") {
                        return { data: null, message: "job_role_ids not found", status: 1 }
                    }
                }
            }
            if (user.job_industries_ids !== undefined) {
                for (var i = 0; i < user.job_industries_ids.length; i++) {
                    const industry = await this._industryRepo.getById(user.job_industries_ids[i])
                    if (industry === null || industry !== null && industry.status !== "publish") {
                        return { data: null, message: "job_industries_ids not found", status: 1 }
                    }
                }
            }
            if (user.candidate_skill_ids !== undefined) {
                for (var i = 0; i < user.candidate_skill_ids.length; i++) {
                    const skill = await this._skillRepo.getById(user.candidate_skill_ids[i])
                    if (skill === null) {
                        return { data: null, message: "candidate_skill_ids not found", status: 1 }
                    }
                }
            }
            if (user.proficient_language_ids !== undefined) {
                for (var i = 0; i < user.proficient_language_ids.length; i++) {
                    const language = await this._languageRepo.getById(user.proficient_language_ids[i])
                    if (language === null || language !== null && language.is_disable === true) {
                        return { data: null, message: "proficient_language_ids not found", status: 1 }
                    }
                }
            }
            if (user.locations_ids !== undefined) {
                for (var i = 0; i < user.locations_ids.length; i++) {
                    const location = await this._cityRepo.getById(user.locations_ids[i])
                    if (location === undefined || location === null || location !== null && location.status !== "publish") {
                        return { data: null, message: "locations_ids not found", status: 1 }
                    }
                }
            }
            let imagePath
            if (updateFields['image'] !== undefined) {
                if (updateFields['image'] === null) {
                    updateFields['image_id'] = updateFields['image']
                    imagePath = null
                } else {
                    let path = updateFields['image'].replace('/static', './assets')
                    if (!fs.existsSync(path)) {
                        return { data: null, message: 'Image not found', status: 1 }
                    } else {
                        imagePath = updateFields['image']
                    }
                }
                delete updateFields['image']
            }
            if (imagePath !== undefined && imagePath !== null) {
                const ext = imagePath.split('.')[2]
                const name = imagePath.split('/')[3]
                const path = Constants.pathImages + name
                const fileDto: any = {
                    type: 'image',
                    name: name,
                    extension: ext,
                    path: path,
                    admin_id: id,
                    user_id: id
                }
                const uploadResult = await this._fileRepo.create(fileDto)
                if (uploadResult !== null) {
                    updateFields['image_id'] = uploadResult._id.toString()
                }
            }
            const result = await this._userRepo.update(id, updateFields)
            result['image'] = imagePath
            return { data: result, message: "Success", status: 0 }
        }
        return { data: null, message: 'The collaborator is not exsited.', status: 1 }
    }

    public async updateEmployer(token: string, id: string, updateFields: {}): Promise<{ data: any, message: string, status: number }> {
        const userInfo = this._jwtToken.getUserInfo(token)
        if (userInfo.permission.includes('staff.all') || userInfo.permission.includes('staff.update')) {
            if (id === userInfo.id) {
                if (updateFields['permission_ids'] !== undefined &&
                    userInfo.email !== 'admin@tatool.vn') {
                    return { data: null, message: "Update failed", status: 1 }
                }
            } else {
                const staff = await this._userRepo.getById(id)
                if (staff.email === 'admin@tatool.vn') {
                    return { data: null, message: "Update failed", status: 1 }
                }
            }
            let imagePath
            if (updateFields['image'] !== undefined) {
                if (updateFields['image'] === null) {
                    updateFields['image_id'] = updateFields['image']
                    imagePath = null
                } else {
                    let path = updateFields['image'].replace('/static', './assets')
                    if (!fs.existsSync(path)) {
                        return { data: null, message: 'Image not found', status: 1 }
                    } else {
                        imagePath = updateFields['image']
                    }
                }
                delete updateFields['image']
            }
            const result = await this._userRepo.getById(id);
            if (result.type_account === 'employer') {
                if (updateFields['permission_ids'] !== undefined) {
                    for (let permissionId of updateFields['permission_ids']) {
                        const permission = await this._permissionRepo.getById(permissionId)
                        if (permission === null) {
                            return { data: null, message: 'Permission not found', status: 1 }
                        }
                    }
                }
                if (imagePath !== undefined && imagePath !== null) {
                    const ext = imagePath.split('.')[2]
                    const name = imagePath.split('/')[3]
                    const path = Constants.pathImages + name
                    const fileDto: any = {
                        type: 'image',
                        name: name,
                        extension: ext,
                        path: path,
                        admin_id: id,
                        user_id: id
                    }
                    const uploadResult = await this._fileRepo.create(fileDto)
                    if (uploadResult !== null) {
                        updateFields['image_id'] = uploadResult._id.toString()
                    }
                }
                const result = await this._userRepo.update(id, updateFields)
                result['image'] = imagePath
                if (updateFields['permission_ids'] !== undefined) {
                    let data = { title: 'Cập nhật thông tin nhân viên', content: `Thông tin đã được cập nhật, vui lòng đăng nhập lại` }
                    let notifyDto = new Notification()
                    notifyDto.title = data.title
                    notifyDto.content = data.content
                    notifyDto.type = NotifyType.STAFF
                    notifyDto.time = new Date().getTime()
                    notifyDto.link = TAtatoolUrl.STAFF_DETAIL + id
                    notifyDto.image = NotifyIconUrl.STAFF
                    notifyDto.receiver_id = id
                    const notifyRecord = await this._notifyRepo.create(notifyDto)
                    if (result.fcm_token !== null) {
                        sendNotification(result.fcm_token, data)
                    }
                }
                return { data: result, message: "Success", status: 0 }
            }
            return { data: null, message: "The employer is not exsited.", status: 1 }
        } else {
            return { data: null, message: 'Permission is required', status: 1 }
        }
    }

    public async getCollaborator(id: string): Promise<{ data: {}, message: string, status: number }> {
        const result = await this._userRepo.getById(id);
        if (result.type_account === 'collaborator') {
            var image = null
            if (result.image_id !== null) {
                image = await this._fileRepo.getById(result.image_id)
                image['path'] = image['path'].replace('./assets', '/static')
            }
            var jobRoles = []
            for (const roleId of result.job_role_ids) {
                const jobRole = await this._jobRoleRepo.getById(roleId)
                if (jobRole !== null && jobRole.status === 'publish') {
                    jobRoles.push(jobRole)
                }
            }
            var jobIndustries = []
            for (const industryId of result.job_industries_ids) {
                const industry = await this._industryRepo.getById(industryId)
                if (industry !== null && industry.status === 'publish') {
                    let tmp = {
                        id: industry._id,
                        name: industry.translate['vi'].name,
                        translate: industry.translate['en'].name
                    }
                    jobIndustries.push(tmp)
                }
            }
            var skills = []
            for (const skillId of result.candidate_skill_ids) {
                const skill = await this._skillRepo.getById(skillId)
                if (skill !== null) {
                    skills.push(skill)
                }
            }
            var languages = []
            for (const languageId of result.proficient_language_ids) {
                const language = await this._languageRepo.getById(languageId)
                if (language !== null && language.is_disable === false) {
                    languages.push(language)
                }
            }
            var locations = []
            for (const locationId of result.locations_ids) {
                const location = await this._cityRepo.getById(locationId)
                if (location !== null && location.status === 'publish') {
                    location['id'] = location._id.toString()
                    location['name'] = location.title
                    delete location._id
                    delete location.title
                    locations.push(location)
                }
            }
            var bankInfo = null
            if (result.bank_id !== null) {
                var frontImage = null
                var backImage = null
                const bankAccount = await this._bankRepo.getById(result.bank_id)
                if (bankAccount.front_side_image_id !== null) {
                    frontImage = await this._fileRepo.getById(bankAccount.front_side_image_id)
                }
                if (bankAccount.back_side_image_id !== null) {
                    backImage = await this._fileRepo.getById(bankAccount.back_side_image_id)
                }
                bankInfo = {
                    _id: bankAccount._id,
                    bank_name: bankAccount.bank_name,
                    account_number: bankAccount.account_number,
                    account_username: bankAccount.account_username,
                    bank_account_fullname: bankAccount.bank_account_fullname,
                    id_number: bankAccount.id_number,
                    id_card_date: bankAccount.id_card_date,
                    issued_location: bankAccount.issued_location,
                    front_side_image: null,
                    back_side_image: null
                }
                if (frontImage !== null) {
                    bankInfo.front_side_image = '/static/bank_account_images/' + frontImage['name']
                }
                if (backImage !== null) {
                    bankInfo.back_side_image = '/static/bank_account_images/' + backImage['name']
                }
            }
            const returnCollaboratorDto = {
                _id: result._id,
                email: result.email,
                type_account: result.type_account,
                first_name: result.first_name,
                last_name: result.last_name,
                birth_day: result.birth_day,
                status: result.status,
                phone: result.phone,
                address: result.address,
                image: image,
                additional_information: result.additional_information,
                job_roles: jobRoles,
                job_levels: result.job_levels,
                job_industries: jobIndustries,
                candidate_skills: skills,
                proficient_languages: languages,
                locations: locations,
                facebook: result.facebook,
                linkedin: result.linkedin,
                skype: result.skype,
                bank_account: bankInfo
            }
            return { data: returnCollaboratorDto, message: 'Success', status: 0 }
        }
        return { data: {}, message: 'The collaborator is not exsited.', status: 1 }

    }

    public async getCollaboratorForEmployer(token: string, id: string): Promise<{ data: {}, message: string, status: number }> {
        const userInfo = this._jwtToken.getUserInfo(token)
        if (userInfo.permission.includes('collaborator.all') || userInfo.permission.includes('collaborator.detail')) {
            const result = await this._userRepo.getById(id);
            if (result.type_account === 'collaborator') {
                var image = null
                if (result.image_id !== null) {
                    image = await this._fileRepo.getById(result.image_id)
                    image['path'] = image['path'].replace('./assets', '/static')
                }
                var jobRoles = []
                for (const roleId of result.job_role_ids) {
                    const jobRole = await this._jobRoleRepo.getById(roleId)
                    if (jobRole !== null && jobRole.status === 'publish') {
                        jobRoles.push(jobRole)
                    }
                }
                var jobIndustries = []
                for (const industryId of result.job_industries_ids) {
                    const industry = await this._industryRepo.getById(industryId)
                    if (industry !== null && industry.status === 'publish') {
                        industry['id'] = industry._id.toString()
                        delete industry._id
                        jobIndustries.push(industry)
                    }
                }
                var skills = []
                for (const skillId of result.candidate_skill_ids) {
                    const skill = await this._skillRepo.getById(skillId)
                    if (skill !== null) {
                        skill['description'] = skill.name
                        delete skill.name
                        skills.push(skill)
                    }
                }
                var languages = []
                for (const languageId of result.proficient_language_ids) {
                    const language = await this._languageRepo.getById(languageId)
                    if (language !== null && language.is_disable === false) {
                        languages.push(language)
                    }
                }
                var locations = []
                for (const locationId of result.locations_ids) {
                    const location = await this._cityRepo.getById(locationId)
                    if (location !== null && location.status === 'publish') {
                        location['id'] = location._id.toString()
                        location['name'] = location.title
                        delete location._id
                        delete location.title
                        locations.push(location)
                    }
                }
                var bankInfo = null
                if (result.bank_id !== null) {
                    var frontImage = null
                    var backImage = null
                    const bankAccount = await this._bankRepo.getById(result.bank_id)
                    if (bankAccount.front_side_image_id !== null) {
                        frontImage = await this._fileRepo.getById(bankAccount.front_side_image_id)
                    }
                    if (bankAccount.back_side_image_id !== null) {
                        backImage = await this._fileRepo.getById(bankAccount.back_side_image_id)
                    }
                    bankInfo = {
                        _id: bankAccount._id,
                        bank_name: bankAccount.bank_name,
                        account_number: bankAccount.account_number,
                        account_username: bankAccount.account_username,
                        bank_account_fullname: bankAccount.bank_account_fullname,
                        id_number: bankAccount.id_number,
                        id_card_date: bankAccount.id_card_date,
                        issued_location: bankAccount.issued_location,
                        front_side_image: null,
                        back_side_image: null
                    }
                    if (frontImage !== null) {
                        bankInfo.front_side_image = '/static/bank_account_images/' + frontImage['name']
                    }
                    if (backImage !== null) {
                        bankInfo.back_side_image = '/static/bank_account_images/' + backImage['name']
                    }

                }
                const returnCollaboratorDto = {
                    _id: result._id,
                    email: result.email,
                    type_account: result.type_account,
                    first_name: result.first_name,
                    last_name: result.last_name,
                    birth_day: result.birth_day,
                    status: result.status,
                    phone: result.phone,
                    address: result.address,
                    image: image,
                    additional_information: result.additional_information,
                    job_roles: jobRoles,
                    job_levels: result.job_levels,
                    job_industries: jobIndustries,
                    candidate_skills: skills,
                    proficient_languages: languages,
                    locations: locations,
                    facebook: result.facebook,
                    linkedin: result.linkedin,
                    skype: result.skype,
                    bank_account: bankInfo
                }
                return { data: returnCollaboratorDto, message: 'Success', status: 0 }
            }
            return { data: {}, message: 'The collaborator is not exsited', status: 1 }
        }
        return { data: {}, message: 'Permission is required', status: 1 }
    }

    public async getEmployer(id: string): Promise<{ data: {}, message: string, status: number }> {
        const result = await this._userRepo.getById(id);
        if (result.type_account === 'employer') {
            var image = null
            if (result.image_id !== null) {
                image = await this._fileRepo.getById(result.image_id)
                image['path'] = '/static/images/' + image['name']
            }
            const employer = new Staff(result)
            delete employer.image_id
            employer['image'] = image
            let permissions = []
            for (let permissionId of employer.permission_ids) {
                const permission = await this._permissionRepo.getById(permissionId)
                if (!permission.is_disable) {
                    permissions.push(permission)
                }
            }
            delete employer.permission_ids
            employer['permissions'] = permissions
            return { data: employer, message: 'Success', status: 0 }
        }
        return { data: {}, message: 'The employer is not exsited.', status: 1 }
    }

    public async updateFCMToken(bearToken: string, updateFields: {}): Promise<{ message: string, status: number }> {
        const userInfo = this._jwtToken.getUserInfo(bearToken)
        const result = await this._userRepo.update(userInfo.id, updateFields)
        if (result !== null) {
            return { message: 'Update fcm token success', status: 0 }
        }
        return { message: 'Update fcm token failed', status: 1 }
    }

    public async getAllEmployer(): Promise<{ employers: any[], message: string, status: number }> {
        const employers = await this._userRepo.findByCondition({ status: 'approval', type_account: 'employer' })
        let listEmployerReturn = []
        for (let employer of employers) {
            const e = {
                id: employer._id.toString(),
                name: employer.first_name + ' ' + employer.last_name,
                email: employer.email
            }
            listEmployerReturn.push(e)
        }
        return { employers: listEmployerReturn, message: 'Success', status: 0 }
    }

    public async loginBySocialAccount(data: {}): Promise<{ data: {}, token: string, status: number, message: string }> {
        let responseUser = {}
        let status
        let user = await this._userRepo.findByCondition({ email: data['email'] })
        if (user.length === 0) {
            data['status'] = 'approval'
            const userDto = new User(data)
            userDto.type_account = 'collaborator'
            const userRecord = await this._userRepo.create(userDto)
            status = userRecord.status
            responseUser = {
                id: userRecord._id.toString(),
                email: userRecord.email,
                first_name: userRecord.first_name,
                last_name: userRecord.last_name,
                type_account: userRecord.type_account,
                image: null
            };
        } else if (user[0].type_account === 'collaborator') {
            status = user[0].status
            responseUser = {
                id: user[0]._id.toString(),
                email: user[0].email,
                first_name: user[0].first_name,
                last_name: user[0].last_name,
                type_account: user[0].type_account,
                image: null
            };
            if (user[0].image_id !== null) {
                const image = await this._fileRepo.getById(user[0].image_id)
                responseUser['image'] = '/static/images/' + image.name
            }
        } else {
            return { data: {}, token: '', status: 1, message: 'User type account not allowed for this login method' }
        }
        let token = await this._jwtToken.generateToken(responseUser['email'], responseUser['first_name'] + ' ' + responseUser['last_name'], responseUser['type_account'], responseUser['id'], [], status)
        return { data: responseUser, token, status: 0, message: 'Success' }
    }

    public async createStaff(token: string, dto: any): Promise<{ data: string | null, message: string, status: number }> {
        const userInfo = this._jwtToken.getUserInfo(token)
        if (userInfo.permission.includes('staff.all') || userInfo.permission.includes('staff.create')) {
            let imagePath
            if (dto.image !== undefined) {
                let path = dto.image.replace('/static', './assets')
                if (!fs.existsSync(path)) {
                    return { data: null, message: 'Image not found', status: 1 }
                } else {
                    imagePath = dto.image
                }
            }
            delete dto.image
            let staff = new User(dto)
            const checkExsitedUser = await this._userRepo.getUserByEmail(staff.email);
            if (checkExsitedUser === null) {
                if (staff.permission_ids !== undefined) {
                    for (let permissionId of staff.permission_ids) {
                        const permission = await this._permissionRepo.getById(permissionId)
                        if (permission === null) {
                            return { data: null, message: 'Permission not found', status: 1 }
                        }
                    }
                }
                const passwordHash = await bcrypt.hash(staff.password, Bcrypt.SaltRound)
                staff.password = passwordHash
                staff.type_account = 'employer'
                staff.create_at = new Date().getTime()
                const staffRecord = await this._userRepo.create(staff)
                if (imagePath !== undefined) {
                    const ext = imagePath.split('.')[2]
                    const name = imagePath.split('/')[3]
                    const path = Constants.pathImages + name
                    const fileDto: any = {
                        type: 'image',
                        name: name,
                        extension: ext,
                        path: path,
                        user_id: staffRecord._id.toString(),
                        admin_id: staffRecord._id.toString()
                    }
                    const uploadResult = await this._fileRepo.create(fileDto)
                    const result = await this._userRepo.update(staffRecord._id.toString(), { image_id: uploadResult._id.toString() })
                    return { data: result._id.toString(), message: "Create success", status: 0 }
                }
                return { data: staffRecord._id.toString(), message: "Create success", status: 0 }
            }
            return { data: null, message: "Email existed", status: 1 }
        } else {
            return { data: null, message: 'Permission is required', status: 1 }
        }
    }

    public async searchStaff(token: string, condition, pageIndex: number, pageSize: number, sortBy: number): Promise<{
        pageIndex: number,
        pageSize: number,
        totalPages: number,
        totalCount: number,
        data: any[],
        message: string,
        status: number
    }> {
        const userInfo = this._jwtToken.getUserInfo(token)
        if (userInfo.permission.includes('staff.all') || userInfo.permission.includes('staff.search')) {
            condition.type_account = 'employer'
            if (condition.keyword !== '') {
                condition.$or = [{ first_name: { $regex: condition.keyword, $options: 'i' } },
                { last_name: { $regex: condition.keyword, $options: 'i' } }]
            }
            delete condition.keyword
            if (condition.status === 0) {
                delete condition.status
            } else if (condition.status === 1) {
                condition.status = 'approval'
            } else if (condition.status === 2) {
                condition.status = 'invisible'
            } else if (condition.status === 3) {
                condition.status = 'lock'
            }
            let sort = {}
            if (sortBy === -1) {
                sort['first_name'] = -1
                sort['last_name'] = -1
            } else if (sortBy === 1) {
                sort['first_name'] = 1
                sort['last_name'] = 1
            } else if (sortBy === -2) {
                sort['create_at'] = -1
            } else if (sortBy === 2) {
                sort['create_at'] = 1
            }
            const offset = pageSize * pageIndex
            const resultData = await this._userRepo.findByConditionAndPaging(condition, offset, pageSize, sort)
            const listStaff = resultData.data
            //const totalCount = listStaff.length
            //const staffs = listStaff.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)
            let staffResults = []
            for (let staff of listStaff) {
                const staffResult = new Staff(staff)
                if (staffResult.image_id !== null) {
                    const image = await this._fileRepo.getById(staffResult.image_id)
                    staffResult['image'] = '/static/images/' + image.name
                } else {
                    staffResult['image'] = null
                }
                delete staffResult.image_id
                staffResults.push(staffResult)
            }
            const result = {
                pageIndex,
                pageSize,
                totalPages: resultData.infoPaging.totalPages,
                totalCount: resultData.infoPaging.totalDocs,
                data: staffResults,
                message: 'Success',
                status: 0
            }
            return result
        }
        else {
            return { pageIndex, pageSize, totalPages: 0, totalCount: 0, data: null, message: 'Permission is required', status: 1 }
        }
    }

    public async updateStatusCollaborator(bearerToken: string, collaboratorId: string, statusNumber: string): Promise<{ message: string, status: number }> {
        const employer = await this._jwtToken.getUserInfo(bearerToken)
        // check quyen
        if (employer.permission.includes('collaborator.all') || employer.permission.includes('collaborator.update_status')) {
            const collaborator = await this._userRepo.getById(collaboratorId)
            if(collaborator.type_account !== 'collaborator'){
                return { message: 'The account is not collaborator', status: 2 }
            }
            if (collaborator !== null) {
                let status = null
                switch (statusNumber) {
                    case '1':
                        status = CollaboratorStatus.APPROVAL
                        break;
                    case '2':
                        status = CollaboratorStatus.LOCK
                        break;
                    case '3':
                        status = CollaboratorStatus.DISABLE
                        break;
                    case '4':
                        status = CollaboratorStatus.WAITING
                        break;
                    default:
                        break;
                }
                await this._userRepo.update(collaborator._id.toString(), { status })
                if (status === CollaboratorStatus.LOCK) {
                    let data = { title: 'Cập nhật trạng thái cộng tác viên', content: `Cộng tác viên ` + collaborator.first_name + ' ' + collaborator.last_name + ' được cập nhật trạng thái thành ' + status }
                    let notifyDto = new Notification()
                    notifyDto.title = data.title
                    notifyDto.content = data.content
                    notifyDto.type = null
                    notifyDto.time = new Date().getTime()
                    notifyDto.link = null
                    notifyDto.image = NotifyIconUrl.INTRODUCTION
                    notifyDto.receiver_id = collaborator._id.toString()
                    await this._notifyRepo.create(notifyDto)
                    if (collaborator.fcm_token !== null) {
                        sendNotification(collaborator.fcm_token, data)
                    }
                }
                return { message: 'Success', status: 0 }
            }
            return { message: 'The collaborator is not found', status: 1 }
        }
       
    }

    public async searchCollaboratorByEmployer(bearerToken: string, condition, pageIndex: number, pageSize: number, sortBy: number): Promise<{ 
        pageIndex: number,
        pageSize: number,
        totalPages: number,
        totalCount: number,
        collaborators: any[],
        message: string,
        status: number
    }>{
        const employer = await this._jwtToken.getUserInfo(bearerToken)
        // check quyen
        if (employer.permission.includes('collaborator.all') || employer.permission.includes('collaborator.search')) {
            const offset = pageSize * pageIndex
            let sort = {};
            if (sortBy === 0) {
                sort['create_at'] = -1
            }else if (sortBy === 1){
                sort['first_name'] = 1
            }
            const status = condition.status 
            switch (status) {
                case "0":
                    delete condition.status
                    break;
                case "1":
                    condition.status = CollaboratorStatus.APPROVAL // có thể làm việc
                    break;
                case "2":
                    condition.status = CollaboratorStatus.LOCK // có thể login xem thông tin lịch sử nhưng không được tạo candidate và refer 
                    break;
                case "3": 
                    condition.status = CollaboratorStatus.DISABLE // không được đăng nhập
                    break;
            
                case "4": 
                    condition.status = CollaboratorStatus.WAITING // mới tạo đợi duyệt
                    break;   
                default:
                    break;
            }
    
            let conditionOr = []
            conditionOr.push({first_name: { $regex: condition.keyword, $options: 'i' }})
            conditionOr.push({last_name: { $regex: condition.keyword, $options: 'i' }})
            conditionOr.push({email: { $regex: condition.keyword, $options: 'i' }})
            conditionOr.push({phone: { $regex: condition.keyword, $options: 'i' }})
            delete condition.keyword
            condition.$or = conditionOr
            condition.type_account = 'collaborator'
            const result = await this._userRepo.findByConditionAndPaging(condition,offset,pageSize,sort)
            const listCollaboratorReturn = []
            for(let collaborator of result.data){
                let imagePath = null
                if(collaborator.image_id !== null){
                    let imageFile: File = await this._fileRepo.getById(collaborator.image_id)
                    imagePath = '/static/images/'+ imageFile.name
                }
                const listCandidateOfCollab = await this._candidateRepo.findByCondition({collaborator_id: collaborator._id.toString()})
                let listCandidateIdApplied = []
                for (let c of listCandidateOfCollab) {
                    const listCandidateIntroducion = await this._candidateIntroductionRepo.findByCondition({ candidate_id: c._id.toString() })
                    if (listCandidateIntroducion.length !== 0) {
                        listCandidateIdApplied.push(c._id.toString())
                    }
                }
                const collabReturn = {
                    collaboratorId: collaborator._id.toString(),
                    first_name: collaborator.first_name,
                    last_name: collaborator.last_name,
                    email: collaborator.email,
                    phone: collaborator.phone,
                    created_date: collaborator.create_at,
                    image:imagePath,
                    status: collaborator.status,
                    numberOfCandidateReferred: listCandidateIdApplied.length
                }
                listCollaboratorReturn.push(collabReturn)
            }
    
            const resultReturn = {
                pageIndex,
                pageSize,
                totalPages: result.infoPaging.totalPages,
                totalCount: result.infoPaging.totalDocs,
                collaborators: listCollaboratorReturn,
                message: 'Success',
                status: 0
            }
            return resultReturn
        }
        
        return {
            pageIndex: 0,
            pageSize: 0,
            totalPages: 0,
            totalCount: 0,
            collaborators: [],
            message: 'Permission is require',
            status: 2
        }
    }

}