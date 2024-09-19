import { inject, injectable } from "inversify";
import { Post } from "../../entities/post";
import { IJobRoleRepository } from "../../repositories/job_role.repository";
import { ICityRepository } from "../../repositories/city.repository";
import { ICountryRepository } from "../../repositories/country.repository";
import { IFunctionRepository } from "../../repositories/function.repository";
import { IIndustryRepository } from "../../repositories/industry.repository";
import { IJobRepository } from "../../repositories/job.repository";
import { IPostRepository } from "../../repositories/post.repository";
import { ISkillRepository } from "../../repositories/skill.repository";
import { IUserRepository } from "../../repositories/user.repository";
import { TYPES } from "../../types";
import { CandidateStatus, Constants, JobGuarantee } from "../../common/constants";
import { ICompanyRepository } from "../../repositories/company.repository";
import { ICommentRepository } from "../../repositories/comment.repository";
import { Token } from "../../JwtToken/JwtToken";
import { IOptionalFieldRepository } from "../../repositories/optional_field.repository";
import { OptionalField } from "../../entities/optional_field";
import { Interview } from "../../entities/interview";
import { IInterviewRepository } from "../../repositories/interview.repository";
import { Company } from "../../entities/company";
import { ILanguageRepository } from "../../repositories/language.repository";
import { IOptionalFieldValueRepository } from "../../repositories/optional_field_value.repository";
import { ISavedPostRepository } from "../../repositories/saved_post.repository";
import { ICandidateRepository } from "../../repositories/candidate.repository";
import { Candidate } from "../../entities/candidate";
import { IFileRepository } from "../../repositories/file.repository";
import { ICandidateIntroductionRepository } from "../../repositories/candidate_introduction.repository";
import { InviteTestService } from "../../invite_test.service";
import { ICandidateIntroductionStatusHistoryRepository } from "../../repositories/candidate_introduction_status_history.repository";

export interface IPostService {
    searchPostByCollaborator(bearerToken: string, condition, pageIndex: number, pageSize: number, sortBy: number): Promise<{
        pageIndex: number,
        pageSize: number,
        totalPages: number,
        totalCount: number,
        posts: any[]
    }>
    searchPostByEmployer(bearerToken: string, condition, pageIndex: number, pageSize: number, sortBy: number): Promise<{
        pageIndex: number,
        pageSize: number,
        totalPages: number,
        totalCount: number,
        message: string,
        status: number,
        posts: any[]
    }>
    searchPostToMatch(condition, pageIndex: number, pageSize: number, sortBy: number): Promise<{
        pageIndex: number,
        pageSize: number,
        totalPages: number,
        totalCount: number,
        posts: any[]
    }>
    createPost(token: string, createField: any): Promise<Post | String>
    updatePost(token: string, id: string, updateFields: any): Promise<Post | String>
    viewDetailPost(id: string): Promise<{ post: {}, message: string, status: number }>
    trackingView(postId: string): Promise<{ message: string, status: number }>
    viewDetailPostForUpdate(bearerToken: string, id: string): Promise<{ post: {}, message: string, status: number }>
    matchJob(candidateIds: string[], postIds: string[]): Promise<{ matched: any[], message: string, status: number }>
    getPostCountForEmployer(token: string): Promise<{ data: {}, message: string, status: number }>
    getPostCountForCollaborator(token: string): Promise<{ data: {}, message: string, status: number }>
    getQuestionPackages(token: string): Promise<{ data: {}, message: string, status: number }>
}

@injectable()
export class PostService implements IPostService {
    @inject(TYPES.IPostRepository) private readonly _postRepo: IPostRepository
    @inject(TYPES.IJobRoleRepository) private readonly _jobRoleRepo: IJobRoleRepository
    @inject(TYPES.ISkillRepository) private readonly _skillRepo: ISkillRepository
    @inject(TYPES.IIndustryRepository) private readonly _industryReppo: IIndustryRepository
    @inject(TYPES.IFunctionRepository) private readonly _functionRepository: IFunctionRepository
    @inject(TYPES.IJobRepository) private readonly _jobRepository: IJobRepository
    @inject(TYPES.ICityRepository) private readonly _cityRepository: ICityRepository
    @inject(TYPES.ICountryRepository) private readonly _countryRepository: ICountryRepository
    @inject(TYPES.IUserRepository) private readonly _userReposittory: IUserRepository
    @inject(TYPES.ICompanyRepository) private readonly _companyRepository: ICompanyRepository
    @inject(TYPES.ICommentRepository) private readonly _commentRepository: ICommentRepository
    @inject(TYPES.IOptionalFieldRepository) private readonly _optFieldRepository: IOptionalFieldRepository
    @inject(TYPES.IOptionalFieldRepository) private readonly _optFieldValueRepository: IOptionalFieldValueRepository
    @inject(TYPES.ILanguageRepository) private readonly _languageRepository: ILanguageRepository
    @inject(TYPES.IInterviewRepository) private readonly _interviewRepository: IInterviewRepository
    @inject(TYPES.Token) private readonly _token: Token
    @inject(TYPES.ISavedPostRepository) private readonly _savePostRepo: ISavedPostRepository
    @inject(TYPES.ICandidateRepository) private readonly _candidateRepo: ICandidateRepository
    @inject(TYPES.ICandidateIntroductionRepository) private readonly _introductionRepo: ICandidateIntroductionRepository
    @inject(TYPES.ICandidateIntroductionStatusHistoryRepository) private readonly _statusHistoryRepo: ICandidateIntroductionStatusHistoryRepository
    @inject(TYPES.IFileRepository) private readonly _fileRepo: IFileRepository
    @inject(TYPES.InviteTestService) private readonly _inviteTestService: InviteTestService
    @inject(TYPES.Token) private readonly _jwtToken: Token

    public async trackingView(postId: string): Promise<{ message: string, status: number }> {
        const post = await this._postRepo.getById(postId)
        if (post !== null) {
            await this._postRepo.update(post._id, { views: (post.views + 1) })
            return { message: 'Success', status: 0 }
        }
        return { message: 'The post is not exsited.', status: 1 };
    }

    public async matchJob(candidateIds: string[], postIds: string[]): Promise<{ matched: any[], message: string, status: number }> {
        let candidates: Candidate[] = []
        let posts: Post[] = []
        for (let id of candidateIds) {
            const candidate = await this._candidateRepo.getById(id)
            if (candidate === null) {
                return { matched: [], message: 'The candidate with id ' + id + ' is not found', status: 1 }
            }
            if (candidate.is_disable) {
                return { matched: [], message: 'The candidate ' + candidate.name + ' is disable', status: 2 }
            }
            if (candidate.status !== CandidateStatus.LOOKINGJOB) {
                return { matched: [], message: 'The candidate ' + candidate.name + ' already has a job', status: 3 }
            }
            candidates.push(candidate)
        }

        for (let id of postIds) {
            const post = await this._postRepo.getById(id)
            if (post === null) {
                return { matched: [], message: 'The post with id ' + id + ' is not found', status: 1 }
            }
            posts.push(post)
        }
        let listMatched = []

        for (let post of posts) {
            let keywordOfPost = post.keywords
            let keywordMatched = []
            for (let candidate of candidates){
                let referred = false
                let allowReferred = true
                let message = null
                const listCandidateIntroducion = await this._introductionRepo.findCandidateIntroductionByCondition({candidate_id: candidate._id.toString()},{introduction_date: -1})
                if(listCandidateIntroducion.length !== 0){
                    const newestStatus = await this._statusHistoryRepo.getNewestStatus(listCandidateIntroducion[0]._id.toString())
                    const regexStatus = /^(Employer Accept)|(Company Viewed)|(Company Accept)|(Send Test)|(Candidate Submit Test)|(Passed Test)|(Schedule Interview)|(Interviewed)|(Offer)|(Onboard)|(Pending)$/
                    if(regexStatus.test(newestStatus.status)){
                        allowReferred = false
                        message = 'This candidate is currently recruiting for another job'
                    }else{
                        const checkReferred = listCandidateIntroducion.find(introduction => introduction.post_id === post._id.toString())
                        if(checkReferred !== undefined){ // ung vien nay da gioi thieu cho job nay roi
                            referred = true
                            allowReferred = false
                            message = 'The candidate has been referred for this post before'
                        }
                    }
                }
                if(post.status !== 'active'){
                    allowReferred = false
                    message = 'The post is not active'
                }
                
                const contentCv = candidate.content_cv
                keywordMatched = keywordOfPost.filter((keyword: string) => new RegExp(keyword, 'i').test(contentCv))
                const cv = await this._fileRepo.getById(candidate.cv_id)
                let percent = '0%'
                if (keywordOfPost.length !== 0) {
                    percent = ((100 / keywordOfPost.length) * keywordMatched.length).toFixed(2) + '%'
                }
                let candidateCities: string[] = []
                let postCities: string[] = []
                for(let cityId of candidate.city_ids){
                    const city = await this._cityRepository.getById(cityId)
                    if(city !== null){
                        candidateCities.push(city.title)
                    }
                }
                for(let cityId of post.city_ids){
                    const city = await this._cityRepository.getById(cityId)
                    if(city !== null){
                        postCities.push(city.title)
                    }
                }
                const company = await this._companyRepository.getById(post.company_id)
                const dtoMatched = {
                    candidateId: candidate._id.toString(),
                    candidateEmail: candidate.email,
                    candidatePhone: candidate.phone,
                    candidateSalaryFrom: candidate.salary_from,
                    candidateSalaryTo: candidate.salary_to,
                    candidateCurrency: candidate.currency,
                    candidateNegotiable: candidate.negotiable,
                    candidateCities,
                    candidateName: candidate.name,
                    candidateCv: cv.path,
                    postId: post._id.toString(),
                    postTitle: post.title,
                    postStatus : post.status,
                    postSalaryFrom: post.salary_from,
                    postSalaryTo: post.salary_to,
                    postCurrency: post.currency,
                    postCommission: post.commission,
                    urgency: post.urgency,
                    postNegotiable: post.negotiable,
                    company: company.company,
                    postCities,
                    referred,
                    allowReferred,
                    message,
                    percent
                }
                listMatched.push(dtoMatched)
            }
        }
        return { matched: listMatched, message: 'Success', status: 0 }
    }

    public async searchPostToMatch(condition, pageIndex: number, pageSize: number, sortBy: number): Promise<{
        pageIndex: number,
        pageSize: number,
        totalPages: number,
        totalCount: number,
        posts: any[]
    }> {
        const offset = pageSize * pageIndex
        // filter
        let listPost: Post[] = []

        if (condition.urgency === '1') {
            condition.urgency = false
        }
        else if (condition.urgency === '2') {
            condition.urgency = true
        }

        if (condition.negotiable === '1') {
            condition.negotiable = false
        }
        else if (condition.negotiable === '2') {
            condition.negotiable = true
        }
        if (condition.company_id === '0') {
            delete condition.company_id
        }
        else {
            const listCompany = condition.company_id.split(',')
            condition.company_id = { $in: listCompany }
        }
        if (condition.city_ids === '0') {
            delete condition.city_ids
        } else {
            const listCity = condition.city_ids.split(',')
            condition.city_ids = { $in: listCity }
        }
        if (condition.status === '0') {
            delete condition.status
        }

        if (condition.type_work === '0') {
            delete condition.type_work
        }
        if (condition.currency === '0') {
            delete condition.currency
        }
        if (condition.salary_to === undefined && condition.salary_from === undefined) { // search all
            delete condition.salary_to
            delete condition.salary_from
        } else if (condition.salary_to === undefined && condition.salary_from !== undefined) { // chon cai lon nhat
            condition.salary_from = { $gte: condition.salary_from }
            delete condition.salary_to
        } else {
            condition.salary_from = { $gte: condition.salary_from, $lte: condition.salary_to }
            delete condition.salary_to
        }

        let conditionOr = []
        //sort
        let sort = {};
        if (sortBy === 0) {
            sort['date_on'] = -1

        } else if (sortBy === 1) {
            sort['title'] = -1
        }
        else if (sortBy === 2) {
            sort['title'] = 1
        }
        else if (sortBy === 3) { // tăng dần 
            sort['salary_from'] = 1
        } else if (sortBy === 4) {
            sort['salary_from'] = -1
        }
        if (condition.guarantee === '0') {
            delete condition.guarantee
        } else if (condition.guarantee === '1') {
            condition.guarantee_type = JobGuarantee.PERIODICWARRANTY
            //condition.guarantee = { $lt: 100, $gt: 0 }
        } else if (condition.guarantee === '2') {
            condition.guarantee_type = JobGuarantee.COMPREHENSIVEWARRANTY
            //condition.guarantee = 100
        } else if (condition.guarantee === '3') {
            condition.guarantee_type = JobGuarantee.NOWARRANTY
            //condition.guarantee = 0
        }
        delete condition.guarantee
        let keywordRegex: string = ''
        let listKeyword = condition.keyword.split(',')
        for (let tmp = 0; tmp < listKeyword.length; tmp++) {
            if ((tmp + 1) === listKeyword.length) {
                keywordRegex += listKeyword[tmp].trim()
            } else {
                keywordRegex += listKeyword[tmp].trim() + '|'
            }
        }
        // let keywordRegex: string = condition.keyword.replace(/,/g,'|')
        delete condition.keyword
        if (condition.keywordType === '0') {
            const taskGetSkillId = this._skillRepo.getIdSkillByLikeName(keywordRegex)
            const taskGetIndistriesId = this._industryReppo.getIdIndustryByLikeName(keywordRegex)
            const taskGetRoleId = this._jobRoleRepo.getIdJobRoleByLikeName(keywordRegex)
            const taskGetLanguageId = this._languageRepository.getIdLanguageByLikeDescription(keywordRegex)
            const listSkill = await taskGetSkillId
        
            conditionOr.push({ skill_ids: { $in: listSkill } })

            const listIndistries = await taskGetIndistriesId
            conditionOr.push({ industry_id: { $in: listIndistries } })
            
            const listRole = await taskGetRoleId
            conditionOr.push({ job_role_ids: { $in: listRole } })

            const listLanguage = await taskGetLanguageId
            conditionOr.push({ language_ids: { $in: listLanguage } })

            conditionOr.push({ job_level: { $regex: keywordRegex, $options: 'i' } })
            conditionOr.push({ title: { $regex: keywordRegex, $options: 'i' } })
            conditionOr.push({ require: { $regex: keywordRegex, $options: 'i' } })
            conditionOr.push({ benefit: { $regex: keywordRegex, $options: 'i' } })
            conditionOr.push({ content: { $regex: keywordRegex, $options: 'i' } })
            conditionOr.push({ notice_for_referrer: { $regex: keywordRegex, $options: 'i' } })
            condition.$or = conditionOr
            delete condition.keywordType

        } else if (condition.keywordType === '1') { // job title
            condition.title = { $regex: keywordRegex, $options: 'i' }
            delete condition.keywordType

        } else if (condition.keywordType === '2') { // job level
            condition.job_level = { $regex: keywordRegex, $options: 'i' }
            delete condition.keywordType
        }
        else if (condition.keywordType === '3') { // job role
            const listJobRole = await this._jobRoleRepo.getIdJobRoleByLikeName(keywordRegex)
            delete condition.keywordType
            condition.job_role_ids = { $in: listJobRole }

        } else if (condition.keywordType === '4') { // skill
            const listSkill = await this._skillRepo.getIdSkillByLikeName(keywordRegex)
            delete condition.keywordType
            condition.skill_ids = { $in: listSkill }

        } else if (condition.keywordType === '5') { // industry 
            const listIndistries = await this._industryReppo.getIdIndustryByLikeName(keywordRegex)
            delete condition.keywordType
            condition.industry_id = { $in: listIndistries }
            

        } else if (condition.keywordType === '6') { // language
            const listLanguage = await this._languageRepository.getIdLanguageByLikeDescription(keywordRegex)
            delete condition.keywordType
            condition.language_ids = { $in: listLanguage }
        }
        else if (condition.keywordType === '7') { // job description
            condition.content = { $regex: keywordRegex, $options: 'i' }
            delete condition.keywordType
           

        } else if (condition.keywordType === '8') { // job requirement
            condition.require = { $regex: keywordRegex, $options: 'i' }
            delete condition.keywordType
        } else if (condition.keywordType === '9') { // benefit
            condition.benefit = { $regex: keywordRegex, $options: 'i' }
            delete condition.keywordType

        } else if (condition.keywordType === '10') { // notice for referrer 
            condition.notice_for_referrer = { $regex: keywordRegex, $options: 'i' }
            delete condition.keywordType
        }
        const result = await this._postRepo.findByConditionAndPaging(condition,offset,pageSize, sort)
        listPost = result.data

        let listPostReturn = [];

        for (let post of listPost) {
            const com = await this._companyRepository.getById(post.company_id)
            let pathFile = null
            if (com.image_file_id !== null) {
                const fileImage = await this._fileRepo.getById(com.image_file_id)
                if (fileImage !== null) {
                    pathFile = fileImage.path
                }
            }
            let listCity = []
            for (let cityId of post.city_ids) {
                const dto = await this._cityRepository.getById(cityId)
                const city = {
                    id: dto._id,
                    name: dto.title
                }
                listCity.push(city)
            }
            const postReturn = {
                id: post._id,
                status: post.status,
                company_name: com.company,
                company_image: pathFile,
                require_number: post.require_number,
                salary_from: post.salary_from,
                salary_to: post.salary_to,
                currency: post.currency,
                urgency: post.urgency,
                negotiable: post.negotiable,
                locations: listCity,
                title: post.title,
                commission: post.commission
            }
            listPostReturn.push(postReturn)
        }
        const dtoReturn = {
            pageIndex,
            pageSize,
            totalPages: result.infoPaging.totalPages,
            totalCount: result.infoPaging.totalDocs,
            posts: listPostReturn
        }
        return dtoReturn;
    }


    public async searchPostByCollaborator(bearerToken: string, condition, pageIndex: number, pageSize: number, sortBy: number): Promise<{
        pageIndex: number,
        pageSize: number,
        totalPages: number,
        totalCount: number,
        posts: any[]
    }> {

        // filter
        let listPost: Post[] = []
        const offset = pageIndex * pageSize
        
        if (condition.urgency === '0') {
            delete condition.urgency
        } else if (condition.urgency === '1') {
            condition.urgency = false
        }
        else if (condition.urgency === '2') {
            condition.urgency = true
        }

        if (condition.negotiable === '0') {
            delete condition.negotiable
        } else if (condition.negotiable === '1') {
            condition.negotiable = false
        }
        else if (condition.negotiable === '2') {
            condition.negotiable = true
        }
        if (condition.company_id === '0') {
            delete condition.company_id
        }
        else {
            const listCompany = condition.company_id.split(',')
            condition.company_id = { $in: listCompany }
        }
        if (condition.city_ids === '0') {
            delete condition.city_ids
        } else {
            const listCity = condition.city_ids.split(',')
            condition.city_ids = { $in: listCity }
        }
        if (condition.status === '0') {
            delete condition.status
        }

        if (condition.type_work === '0') {
            delete condition.type_work
        }
        if (condition.guarantee === '0') {
            delete condition.guarantee
        } else if (condition.guarantee === '1') {
            condition.guarantee_type = JobGuarantee.PERIODICWARRANTY
            //condition.guarantee = { $lt: 100, $gt: 0 }
        } else if (condition.guarantee === '2') {
            condition.guarantee_type = JobGuarantee.COMPREHENSIVEWARRANTY
            //condition.guarantee = 100
        } else if (condition.guarantee === '3') {
            condition.guarantee_type = JobGuarantee.NOWARRANTY
            //condition.guarantee = 0
        }
        delete condition.guarantee
        //
        if (condition.currency === '0') {
            delete condition.currency
        }
        if (condition.salary_to === undefined && condition.salary_from === undefined) { // search all
            delete condition.salary_to
            delete condition.salary_from
        } else if (condition.salary_to === undefined && condition.salary_from !== undefined) { // chon cai lon nhat
            condition.salary_from = { $gte: condition.salary_from }
            delete condition.salary_to
        } else {
            condition.salary_from = { $gte: condition.salary_from, $lte: condition.salary_to }
            delete condition.salary_to
        }

        let conditionOr = []
        //sort
        let sort = {};
        if (sortBy === 0) {
            sort['date_on'] = -1 // sửa lại thành date_on
            
        } else if (sortBy === 1) {
            sort['title'] = 1
        }
        else if (sortBy === 3) {
            sort['bonus'] = 1
        } else if (sortBy === 4) {
            sort['bonus'] = -1
        }
        else if (sortBy === 5) { // tăng dần 
            sort['salary_from'] = 1
        } else if (sortBy === 6) {
            sort['salary_from'] = -1
        }

        // nho check them post status
        if (condition.keywordType === '0') {
            const taskGetSkillId = this._skillRepo.getIdSkillByLikeName(condition.keyword)
            const taskGetIndistriesId = this._industryReppo.getIdIndustryByLikeName(condition.keyword)
            const taskGetRoleId = this._jobRoleRepo.getIdJobRoleByLikeName(condition.keyword)
            const taskGetLanguageId = this._languageRepository.getIdLanguageByLikeDescription(condition.keyword)
            const resultAllTask = await Promise.all([taskGetSkillId, taskGetIndistriesId, taskGetRoleId, taskGetLanguageId])
            const listSkill = resultAllTask[0]
            conditionOr.push({ skill_ids: { $in: listSkill } })
            const listIndistries = resultAllTask[1]
            
            conditionOr.push({ industry_id: { $in: listIndistries } })
            const listRole = resultAllTask[2]
            
            conditionOr.push({ job_role_ids: { $in: listRole } })
            const listLanguage = resultAllTask[3]
            
            conditionOr.push({ language_ids: { $in: listLanguage } })
            conditionOr.push({ job_level: { $regex: condition.keyword, $options: 'i' } })
            conditionOr.push({ title: { $regex: condition.keyword, $options: 'i' } })
            conditionOr.push({ require: { $regex: condition.keyword, $options: 'i' } })
            conditionOr.push({ benefit: { $regex: condition.keyword, $options: 'i' } })
            conditionOr.push({ content: { $regex: condition.keyword, $options: 'i' } })
            conditionOr.push({ notice_for_referrer: { $regex: condition.keyword, $options: 'i' } })
            condition.$or = conditionOr
            delete condition.keyword
            delete condition.keywordType
        } else if (condition.keywordType === '1') { // job title
            condition.title = { $regex: condition.keyword, $options: 'i' }
            delete condition.keyword
            delete condition.keywordType
        } else if (condition.keywordType === '2') { // job level
            condition.job_level = { $regex: condition.keyword, $options: 'i' }
            delete condition.keywordType
            delete condition.keyword

        }
        else if (condition.keywordType === '3') { // job role
            const listJobRole = await this._jobRoleRepo.getIdJobRoleByLikeName(condition.keyword)
            delete condition.keyword
            delete condition.keywordType
            condition.job_role_ids = { $in: listJobRole }

        } else if (condition.keywordType === '4') { // skill
            const listSkill = await this._skillRepo.getIdSkillByLikeName(condition.keyword)
            delete condition.keyword
            delete condition.keywordType
            condition.skill_ids = { $in: listSkill }
        } else if (condition.keywordType === '5') { // industry 
            const listIndistries = await this._industryReppo.getIdIndustryByLikeName(condition.keyword)
            delete condition.keyword
            delete condition.keywordType
            condition.industry_id = { $in: listIndistries }

        } else if (condition.keywordType === '6') { // language
            const listLanguage = await this._languageRepository.getIdLanguageByLikeDescription(condition.keyword)
            delete condition.keyword
            delete condition.keywordType
            condition.language_ids = { $in: listLanguage }

        }
        else if (condition.keywordType === '7') { // job description
            condition.content = { $regex: condition.keyword, $options: 'i' }
            delete condition.keywordType
            delete condition.keyword


        } else if (condition.keywordType === '8') { // job requirement
            condition.require = { $regex: condition.keyword, $options: 'i' }
            delete condition.keywordType
            delete condition.keyword

        } else if (condition.keywordType === '9') { // benefit
            condition.benefit = { $regex: condition.keyword, $options: 'i' }
            delete condition.keywordType
            delete condition.keyword

        } else if (condition.keywordType === '10') { // notice for referrer 
            condition.notice_for_referrer = { $regex: condition.keyword, $options: 'i' }
            delete condition.keywordType
            delete condition.keyword
        }
        const result = await this._postRepo.findByConditionAndPaging(condition,offset,pageSize, sort)
        listPost = result.data
        let listPostReturn = [];

        for (let post of listPost) {
            const com = await this._companyRepository.getById(post.company_id)
            let pathFile = null
            if (com.image_file_id !== null) {
                const fileImage = await this._fileRepo.getById(com.image_file_id)
                if (fileImage !== null) {
                    pathFile = '/static/company_images/'+ fileImage.name
                }
            }
            let listCity = []
            for (let cityId of post.city_ids) {
                const dto = await this._cityRepository.getById(cityId)
                const city = {
                    id: dto._id,
                    name: dto.title
                }
                listCity.push(city)
            }
            let guarantee_type = ''
            if (post.guarantee === 0) {
                guarantee_type = 'Comprehensive warranty'
            } else if (post.guarantee > 0 && post.guarantee < 100) {
                guarantee_type = 'Periodic warranty'
            } else if (post.guarantee === 100) {
                guarantee_type = 'No warranty'
            }
            // check xem da co trong save post chưa
            let save_post_id = null
            let saved = false
            
            if (bearerToken !== undefined) {
                const userData = await this._token.getUserInfo(bearerToken)
                let resultCheckSavePost = await this._savePostRepo.checkSavedPostOfUser({ user_id: userData.id, post_id: post._id })
                save_post_id = resultCheckSavePost.savePostId
                saved = resultCheckSavePost.saved
            }

            const postReturn = {
                id: post._id,
                status: post.status,
                company_name: com.company,
                company_image: pathFile,
                require_number: post.require_number,
                salary_from: post.salary_from,
                salary_to: post.salary_to,
                guarantee: {
                    name: post.guarantee_type,
                    value: post.guarantee
                },
                negotiable: post.negotiable,
                urgency: post.urgency,
                currency: post.currency,
                bonus: post.bonus,
                locations: listCity,
                title: post.title,
                commission: post.commission,
                saved,
                save_post_id

            }
            listPostReturn.push(postReturn)
        }

        if (sortBy === 2) {
            listPostReturn = listPostReturn.sort((a, b) => a.company_name.toLowerCase().localeCompare(b.company_name.toLowerCase()))
        }
        //listPostReturn = listPostReturn.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)
        const dtoReturn = {
            pageIndex,
            pageSize,
            totalPages: result.infoPaging.totalPages,
            totalCount: result.infoPaging.totalDocs,
            posts: listPostReturn
        }
        return dtoReturn;
    }

    public async searchPostByEmployer(bearerToken: string, condition, pageIndex: number, pageSize: number, sortBy: number): Promise<{
        pageIndex: number,
        pageSize: number,
        totalPages: number,
        totalCount: number,
        message: string,
        status: number,
        posts: any[]
    }> {
        const employer = this._jwtToken.getUserInfo(bearerToken)
        if (employer.permission.includes('post.all') || employer.permission.includes('post.search')) {
            const offset = pageIndex * pageSize
            let listPost: Post[] = []
            let listCompany: Company[] = []
            let sort = {};
            if (sortBy === 0) {
                sort['date_on'] = -1 // -1 la giam dan 
            } else if (sortBy === 1) {
                sort['title'] = 1
            }
            else if (sortBy === 2) { // 
                sort['salary_from'] = -1
            }
            if (condition.status === '0') {
                delete condition.status
            }
            // condition.user_id = userData.id // admin chỉ thấy các post mà admin đó tạo 
            let totalPages = 0
            let totalCounts = 0
            let listPostReturn = []
            if (condition.keyword_type === 0) {
                condition.title = { $regex: condition.keyword, $options: 'i' }

                delete condition.keyword_type
                delete condition.keyword
                const result = await this._postRepo.findByConditionAndPaging(condition,offset,pageSize, sort)
                listPost = result.data 
                totalPages = result.infoPaging.totalPages
                totalCounts = result.infoPaging.totalDocs
                for (let post of listPost) {
                    const com = await this._companyRepository.getById(post.company_id)
                    let pathFile = null
                    if (com.image_file_id !== null) {
                        const fileImage = await this._fileRepo.getById(com.image_file_id)
                        if (fileImage !== null) {
                            pathFile = '/static/company_images/'+ fileImage.name
                        }
                    }
                    let listCity = []
                    for (let cityId of post.city_ids) {
                        const dto = await this._cityRepository.getById(cityId)
                        const city = {
                            id: dto._id,
                            name: dto.title
                        }
                        listCity.push(city)
                    }
                    const postReturn = {
                        id: post._id,
                        status: post.status,
                        company_name: com.company,
                        company_image: pathFile,
                        require_number: post.require_number,
                        salary_from: post.salary_from,
                        salary_to: post.salary_to,
                        guarantee: {
                            name: post.guarantee_type,
                            value: post.guarantee
                        },
                        negotiable: post.negotiable,
                        urgency: post.urgency,
                        currency: post.currency,
                        bonus: post.bonus,
                        locations: listCity,
                        title: post.title,
                        commission: post.commission
                        //
                    }
                    listPostReturn.push(postReturn)
                }
            } else if (condition.keyword_type === 1) {
                listCompany = await this._companyRepository.getCompanyByLikeName(condition.keyword)
                const listCompanyId: string[] = []
                listCompany.map(company => listCompanyId.push(company._id.toString()))
                delete condition.keyword
                delete condition.keyword_type
                condition.company_id = { $in: listCompanyId }
                const result = await this._postRepo.findByConditionAndPaging(condition,offset,pageSize, sort)
                listPost = result.data
                totalPages = result.infoPaging.totalPages
                totalCounts = result.infoPaging.totalDocs
                for (let post of listPost) {
                    const com = listCompany.find(company => company._id.toString() === post.company_id)
                    let pathFile = null
                    if (com.image_file_id !== null) {
                        const fileImage = await this._fileRepo.getById(com.image_file_id)
                        if (fileImage !== null) {
                            pathFile = '/static/company_images/'+ fileImage.name
                        }
                    }
                    let listCity = []
                    for (let cityId of post.city_ids) {
                        const dto = await this._cityRepository.getById(cityId)
                        const city = {
                            id: dto._id,
                            name: dto.title
                        }
                        listCity.push(city)
                    }
                    const postReturn = {
                        id: post._id,
                        status: post.status,
                        company_name: com.company,
                        company_image: pathFile,
                        require_number: post.require_number,
                        salary_from: post.salary_from,
                        salary_to: post.salary_to,
                        guarantee: {
                            name: post.guarantee_type,
                            value: post.guarantee
                        },
                        negotiable: post.negotiable,
                        urgency: post.urgency,
                        currency: post.currency,
                        bonus: post.bonus,
                        locations: listCity,
                        title: post.title,
                        commission: post.commission
                    }
                    listPostReturn.push(postReturn)
                }
            }
            const dtoReturn = {
                pageIndex,
                pageSize,
                totalPages,
                totalCount: totalCounts,
                message: 'Success',
                status: 0,
                posts: listPostReturn
            }
            // page index de biet trang nao
            return dtoReturn
        }
        return {
            pageIndex: 0,
            pageSize: 0,
            totalPages: 0,
            totalCount: 0,
            message: 'Permission is required',
            status: 1,
            posts: []
        }

    }



    public async createPost(token: string, createField: any): Promise<Post | String> {
        const userInfo = this._jwtToken.getUserInfo(token)
        if (userInfo.permission.includes('post.all') || userInfo.permission.includes('post.create')) {
            var resultNotFound = false
            const optFields = createField.optional_fields
            delete createField.optional_fields
            const interviews = createField.interviews
            delete createField.interviews
            const post = new Post(createField)
            const insdustry = await this._industryReppo.getById(post.industry_id)
            if (insdustry !== null && insdustry.status === "publish") {
                const functionResult = await this._functionRepository.getById(post.function_id)
                if (functionResult !== null && functionResult.status === "publish" && functionResult.industry_id === post.industry_id) {
                    const job = await this._jobRepository.getById(post.job_id)
                    if (job !== null && job.status === "publish" && job.function_id === post.function_id) {
                        const user = await this._userReposittory.getById(post.user_id)
                        if (user !== null && user.status === "approval" && user.type_account === "employer") {
                            var i
                            for (i = 0; i < post.skill_ids.length; i++) {
                                const skill = await this._skillRepo.getById(post.skill_ids[i])
                                if (skill === null) {
                                    resultNotFound = true
                                }
                            }
                            if (!resultNotFound) {
                                var i
                                var jobLevels = post.job_level.split(";")
                                for (i = 0; i < jobLevels.length; i++) {
                                    if (!Constants.jobLevel.includes(jobLevels[i])) {
                                        resultNotFound = true
                                    }
                                }
                                if (!resultNotFound) {
                                    var i
                                    for (i = 0; i < post.job_role_ids.length; i++) {
                                        const jobRole = await this._jobRoleRepo.getById(post.job_role_ids[i])
                                        if (jobRole === null || jobRole !== null && jobRole.status !== "publish") {
                                            resultNotFound = true
                                        }
                                    }
                                    if (!resultNotFound) {
                                        const country = await this._countryRepository.getById(post.country_id)
                                        if (country !== null && country.status === "publish") {
                                            var i
                                            for (i = 0; i < post.city_ids.length; i++) {
                                                const city = await this._cityRepository.getById(post.city_ids[i])
                                                if (city === null || city !== null && city.status !== "publish" ||
                                                    city !== null && city.country_id !== post.country_id) {
                                                    resultNotFound = true
                                                }
                                            }
                                            if (!resultNotFound) {
                                                const company = await this._companyRepository.getById(post.company_id)
                                                if (company !== null && company.status === 'available') {
                                                    for (i = 0; i < post.language_ids.length; i++) {
                                                        const language = await this._languageRepository.getById(post.language_ids[i])
                                                        if (language === null || language !== null && language.is_disable === true) {
                                                            resultNotFound = true
                                                        }
                                                    }
                                                    if (!resultNotFound) {
                                                        if (optFields !== undefined) {
                                                            let optionalIds = []
                                                            for (let option of optFields) {
                                                                if (!Constants.optionalFieldType.includes(option['type'])) {
                                                                    return 'optional_field type not found'
                                                                }
                                                                const newOpt = new OptionalField(option)
                                                                const optionalField = await this._optFieldRepository.create(newOpt)
                                                                optionalIds.push(optionalField._id.toString())
                                                            }
                                                            post.optional_field_ids = optionalIds
                                                        }
                                                        if (interviews !== undefined) {
                                                            let interviewIds = []
                                                            for (let interview of interviews) {
                                                                if (!Constants.interviewType.includes(interview['type'])) {
                                                                    return 'interview type not found'
                                                                }
                                                                const newInterview = new Interview(interview)
                                                                const interviewRecord = await this._interviewRepository.create(newInterview)
                                                                interviewIds.push(interviewRecord._id.toString())
                                                            }
                                                            post.interview_ids = interviewIds
                                                        }
                                                        post.status = 'pause'
                                                        const result = await this._postRepo.create(post)
                                                        return result
                                                    } else {
                                                        return 'language_id not found'
                                                    }
                                                } else {
                                                    return 'company_id not found'
                                                }
                                            }
                                            else {
                                                return 'city_id not found'
                                            }
                                        } else {
                                            return 'country_id not found'
                                        }
                                    } else {
                                        return 'job_role_id not found'
                                    }
                                } else {
                                    return 'joblevel not found'
                                }
                            } else {
                                return 'skill_id not found'
                            }
                        } else {
                            return 'user_id not found'
                        }
                    } else {
                        return 'job_id not found'
                    }
                } else {
                    return "function_id not found"
                }
            } else {
                return "industry_id not found"
            }
        }
        return "Permission is required"
    }


    public async viewDetailPostForUpdate(bearerToken: string, id: string): Promise<{ post: {}, message: string, status: number }> {
        const employer = this._jwtToken.getUserInfo(bearerToken)
        if (employer.permission.includes('post.all') || employer.permission.includes('post.detail')) {
            const post = await this._postRepo.getById(id)
            if (post !== null) {
                const listCityId = post.city_ids;
                const listJobRoleId = post.job_role_ids;
                const listSkillId = post.skill_ids;
                const companyId = post.company_id;
                const industryId = post.industry_id;
                const jobId = post.job_id;
                const functionId = post.function_id;
                const countryId = post.country_id;
                const listlanguageId = post.language_ids;
                const listOptionFieldId = post.optional_field_ids;
                const listInterviewId = post.interview_ids;
                const userId = post.user_id;
                const listCity = []
                const listJobRole = []
                const listSkill = []
                const listLanguage = []
                const listOptionField = []
                const listInterview = []

                for (let interviewId of listInterviewId) {
                    const interview = await this._interviewRepository.getById(interviewId)
                    listInterview.push({
                        id: interview._id,
                        type: interview.type,
                        stage: interview.stage,
                        stage_description: interview.stage_description
                    })
                }
                delete post.interview_ids
                post['interviews'] = listInterview

                for (let cityId of listCityId) {
                    const city = await this._cityRepository.getById(cityId)
                    listCity.push({ id: city._id, name: city.title })
                }
                delete post.city_ids
                post['cities'] = listCity
                for (let jobRoleId of listJobRoleId) {
                    const jobRole = await this._jobRoleRepo.getById(jobRoleId)
                    listJobRole.push({ _id: jobRole._id, name: jobRole.name })
                }
                delete post.job_role_ids
                post['job_role'] = listJobRole

                for (let languagueId of listlanguageId) {
                    const language = await this._languageRepository.getById(languagueId)
                    listLanguage.push({ _id: language._id, name: language.name })
                }
                delete post.language_ids
                post['languages'] = listLanguage

                for (let skillId of listSkillId) {
                    const skill = await this._skillRepo.getById(skillId)
                    listSkill.push({ _id: skill._id, name: skill.name })
                }
                delete post.skill_ids
                post['skills'] = listSkill

                for (let optionFieldId of listOptionFieldId) {
                    const optionField = await this._optFieldRepository.getById(optionFieldId)
                    listOptionField.push({
                        id: optionField._id,
                        title: optionField.title,
                        hint: optionField.hint,
                        type: optionField.type,
                        max_value: optionField.max_value,
                        min_value: optionField.min_value,
                        data: optionField.data
                    })
                }

                post['optional_fields'] = listOptionField
                delete post.optional_field_ids

                const company = await this._companyRepository.getById(companyId)
                delete post.company_id
                post['company'] = {
                    id: company._id,
                    name: company.company,
                    contact_name: company.contact_name,
                    email: company.email,
                    phone: company.phone
                }

                const industry = await this._industryReppo.getById(industryId)
                delete post.industry_id
                post['industry'] = { id: industry._id, name: industry.name }

                const job = await this._jobRepository.getById(jobId)
                delete post.job_id
                post['job'] = { id: job._id, name: job.name }

                const myFunction = await this._functionRepository.getById(functionId)
                delete post.function_id
                post['function'] = { id: myFunction._id, name: myFunction.name }

                const country = await this._countryRepository.getById(countryId)
                delete post.country_id
                post['country'] = { id: country._id, name: country.title }

                // bo user id
                const user = await this._userReposittory.getById(userId)
                delete post.user_id
                delete post.views

                post['user'] = { id: user._id, name: user.first_name + ' ' + user.last_name }

                return { post, message: 'Success', status: 0 }
                // page index de biet trang nao
            }
            return { post: {}, message: 'The post is not exsited', status: 1 };
        }
        return { post: {}, message: 'Permission is required', status: 2 };
    }

    public async viewDetailPost(id: string): Promise<{ post: {}, message: string, status: number }> {
        const post = await this._postRepo.getById(id)
        if (post !== null) {
            const listCityId = post.city_ids;
            const listJobRoleId = post.job_role_ids;
            const listSkillId = post.skill_ids;
            const companyId = post.company_id;
            const industryId = post.industry_id;
            const jobId = post.job_id;
            const functionId = post.function_id;
            const countryId = post.country_id;
            const listlanguageId = post.language_ids;
            const listInterviewId = post.interview_ids;
            const userId = post.user_id;
            const listCity = []
            const listJobRole = []
            const listSkill = []
            const listLanguage = []
            const listInterview = []
            for (let cityId of listCityId) {
                const city = await this._cityRepository.getById(cityId)
                listCity.push({ id: city._id, name: city.title })
            }
            delete post.city_ids
            post['cities'] = listCity
            for (let jobRoleId of listJobRoleId) {
                const jobRole = await this._jobRoleRepo.getById(jobRoleId)
                listJobRole.push({ id: jobRole._id, name: jobRole.name })
            }
            delete post.job_role_ids
            post['job_role'] = listJobRole

            for (let languagueId of listlanguageId) {
                const language = await this._languageRepository.getById(languagueId)
                listLanguage.push({ id: language._id, name: language.name })
            }
            delete post.language_ids
            post['languages'] = listLanguage

            for (let skillId of listSkillId) {
                const skill = await this._skillRepo.getById(skillId)
                listSkill.push({ id: skill._id, description: skill.name })
            }
            delete post.skill_ids
            post['skills'] = listSkill

            for (let interviewId of listInterviewId) {
                const interview = await this._interviewRepository.getById(interviewId)
                listInterview.push({ id: interview._id, stage: interview.stage, description: interview.stage_description, type: interview.type })
            }
            delete post.interview_ids
            post['interviews'] = listInterview

            const company = await this._companyRepository.getById(companyId)
            let pathFile = null
            if (company.image_file_id !== null) {
                const fileImage = await this._fileRepo.getById(company.image_file_id)
                if (fileImage !== null) {
                    pathFile ='/static/company_images/'+ fileImage.name
                }
            }
            delete post.company_id
            post['company'] = {
                id: company._id,
                name: company.company,
                company_image: pathFile,
                address: company.address,
                website: company.website,
                introduction: company.introduction,
                email: company.email,
                phone: company.phone
            }

            const industry = await this._industryReppo.getById(industryId)
            delete post.industry_id
            post['industry'] = { id: industry._id, name: industry.name }

            const job = await this._jobRepository.getById(jobId)
            delete post.job_id
            post['job'] = { id: job._id, name: job.name }

            const myFunction = await this._functionRepository.getById(functionId)
            delete post.function_id
            post['function'] = { id: myFunction._id, name: myFunction.name }

            const country = await this._countryRepository.getById(countryId)
            delete post.country_id
            post['country'] = { id: country._id, name: country.title }

            // bo user id
            const user = await this._userReposittory.getById(userId)
            delete post.user_id
            delete post.question_packages
            delete post.optional_field_ids
            post['user'] = { id: user._id, name: user.first_name + ' ' + user.last_name }

            return { post, message: 'Success', status: 0 }
            // page index de biet trang nao
        }
        return { post: {}, message: 'The post is not exsited', status: 2 };
    }


    // public async getAllPost(){        
    //     const result = await this._postRepo.getAllPaging(0,-1)
    //     return result
    // }

    public async updatePost(token: string, id: string, updateFields: any): Promise<Post | String> {
        const userInfo = this._jwtToken.getUserInfo(token)
        if (userInfo.permission.includes('post.all') || userInfo.permission.includes('post.update')) {
            const optFields = updateFields.optional_fields
            delete updateFields.optional_fields
            const interviews = updateFields.interviews
            delete updateFields.interviews
            const post = new Post(updateFields)
            var existedPost: Post
            if (post.status !== undefined) {
                if (Object.keys(updateFields).length === 2) {
                    if(updateFields.status === 'active'){
                        updateFields.date_on = new Date().setHours(0, 0, 0, 0)
                        existedPost = await this._postRepo.getById(id)
                        if(updateFields.date_on > existedPost.date_off || updateFields.date_on > existedPost.date_end){
                            return "date_on must before date_off and date_end"
                        }
                    }
                    const result = await this._postRepo.update(id, updateFields)
                    return result
                } else {
                    return "update status failed"
                }
            }
            if (post.job_id !== undefined && post.function_id === undefined && post.industry_id === undefined
                || post.function_id !== undefined && post.industry_id === undefined
                || post.city_ids !== undefined && post.country_id === undefined
                || post.date_on !== undefined && (post.date_off === undefined || post.date_end === undefined)
                || post.date_on === undefined && (post.date_off !== undefined || post.date_end !== undefined)
                || post.bonus_start_date === undefined && post.bonus_end_date !== undefined
                || post.bonus_end_date === undefined && post.bonus_start_date !== undefined) {
                existedPost = await this._postRepo.getById(id)
                if (existedPost === null) {
                    return "post not found"
                }
            }
            if (post.industry_id !== undefined) {
                if (post.function_id !== undefined && post.job_id !== undefined) {
                    const functionResult = await this._functionRepository.getById(post.function_id)
                    if (functionResult === null || functionResult !== null && functionResult.status !== "publish"
                        || functionResult !== null && functionResult.industry_id !== post.industry_id) {
                        return "function_id not found"
                    }
                    const job = await this._jobRepository.getById(post.job_id)
                    if (job === null || job !== null && job.status !== "publish"
                        || job !== null && job.function_id !== post.function_id) {
                        return "job_id not found"
                    }
                } else {
                    return "function_id and job_id required"
                }
            } else if (post.function_id !== undefined) {
                const functionResult = await this._functionRepository.getById(post.function_id)
                if (functionResult === null || functionResult !== null && functionResult.status !== "publish"
                    || functionResult !== null && functionResult.industry_id !== existedPost.industry_id) {
                    return "function_id not found"
                }
                if (post.job_id !== undefined) {
                    const job = await this._jobRepository.getById(post.job_id)
                    if (job === null || job !== null && job.status !== "publish"
                        || job !== null && job.function_id !== post.function_id) {
                        return "job_id not found"
                    }
                } else {
                    return "job_id required"
                }
            } else if (post.job_id !== undefined) {
                const job = await this._jobRepository.getById(post.job_id)
                if (job === null || job !== null && job.function_id !== existedPost.function_id) {
                    return "job_id not match"
                }
            }
            if (post.user_id !== undefined) {
                const user = await this._userReposittory.getById(post.user_id)
                if (user === null) {
                    return "user_id not found"
                }
            }
            if (post.country_id !== undefined) {
                if (post.city_ids !== undefined) {
                    for (var i = 0; i < post.city_ids.length; i++) {
                        const city = await this._cityRepository.getById(post.city_ids[i])
                        if (city === null || city !== null && city.country_id !== post.country_id) {
                            return "city_id not found"
                        }
                    }
                } else {
                    return "city_ids required"
                }
            } else if (post.city_ids !== undefined) {
                for (var i = 0; i < post.city_ids.length; i++) {
                    const city = await this._cityRepository.getById(post.city_ids[i])
                    if (city === null || city !== null && city.country_id !== existedPost.country_id) {
                        return "city_id not found"
                    }
                }
            }
            if (post.bonus_start_date !== undefined && post.bonus_end_date === undefined) {
                console.log(post.bonus_start_date + " " + existedPost.bonus_end_date)
                if (post.bonus_start_date > existedPost.bonus_end_date) {
                    return "bonus_start_date must before bonus_end_date"
                }
            } else if (post.bonus_start_date === undefined && post.bonus_end_date !== undefined && post.bonus_end_date < existedPost.bonus_start_date) {
                console.log(post.bonus_end_date + " " + existedPost.bonus_start_date)
                return "bonus_start_date must before bonus_end_date"
            }
            if (post.job_level !== undefined) {
                var jobLevels = post.job_level.split(";")
                for (i = 0; i < jobLevels.length; i++) {
                    if (!Constants.jobLevel.includes(jobLevels[i])) {
                        return "job_level not found"
                    }
                }
            }
            if (post.job_role_ids !== undefined) {
                for (var i = 0; i < post.job_role_ids.length; i++) {
                    const jobRole = await this._jobRoleRepo.getById(post.job_role_ids[i])
                    if (jobRole === null || jobRole !== null && jobRole.status !== 'publish') {
                        return "job_role_ids not found"
                    }
                }
            }
            if (post.skill_ids !== undefined) {
                for (var i = 0; i < post.skill_ids.length; i++) {
                    const skill = await this._skillRepo.getById(post.skill_ids[i])
                    if (skill === null) {
                        return "skill_ids not found"
                    }
                }
            }
            if (post.language_ids !== undefined) {
                for (var i = 0; i < post.language_ids.length; i++) {
                    const language = await this._languageRepository.getById(post.language_ids[i])
                    if (language === null || language !== null && language.is_disable === true) {
                        return "language_ids not found"
                    }
                }
            }
            if (post.company_id !== undefined) {
                const company = await this._companyRepository.getById(post.company_id)
                if (company === null) {
                    return "company_id not found"
                }
            }
            if (optFields !== undefined) {
                let optionalIds = []
                for (let option of optFields) {
                    if (!Constants.optionalFieldType.includes(option['type'])) {
                        return 'optional_field type not found'
                    }
                    if (option.action === undefined) {
                        return 'Update failed'
                    } else if (option.action === null) {
                        const optionalField = await this._optFieldRepository.getById(option.id)
                        if (optionalField !== null) {
                            optionalIds.push(optionalField._id.toString())
                        } else {
                            return 'optional_field_id not found'
                        }
                    } else if (option.action === 'create') {
                        const newOpt = new OptionalField(option)
                        const optionalField = await this._optFieldRepository.create(newOpt)
                        optionalIds.push(optionalField._id.toString())
                    } else if (option.action === 'update') {
                        const id = option.id
                        delete option.id
                        const optionalField = await this._optFieldRepository.update(id, option)
                        optionalIds.push(optionalField._id.toString())
                    }
                    //if delete, keep optional field in database for old candidate 
                    // else if (option.action === 'delete') {
                    //     const optionalField = await this._optFieldRepository.delete(option.id)
                    // }
                }
                updateFields.optional_field_ids = optionalIds
            }
            if (interviews !== undefined) {
                let interviewIds = []
                for (let interview of interviews) {

                    if (interview.action === undefined) {
                        return 'Update failed'
                    } else if (interview.action === null) {
                        const interviewRecord = await this._interviewRepository.getById(interview.id)
                        if (interviewRecord !== null) {
                            interviewIds.push(interviewRecord._id.toString())
                        } else {
                            return 'interview_id not found'
                        }
                    } else if (interview.action === 'create') {
                        if (!Constants.interviewType.includes(interview['type'])) {
                            return 'interview type not found'
                        }
                        const newInterview = new Interview(interview)
                        const interviewRecord = await this._interviewRepository.create(newInterview)
                        interviewIds.push(interviewRecord._id.toString())
                    } else if (interview.action === 'update') {
                        if (interview['type'] !== undefined && !Constants.interviewType.includes(interview['type'])) {
                            return 'interview type not found'
                        }
                        const id = interview.id
                        delete interview.id
                        const interviewRecord = await this._interviewRepository.update(id, interview)
                        interviewIds.push(interviewRecord._id.toString())
                    }
                    //if delete, keep interview in database for old candidate 
                    // else if (interview.action === 'delete') {
                    //     const interviewRecord = await this._interviewRepository.delete(interview.id)
                    // }
                }
                updateFields.interview_ids = interviewIds
            }
            updateFields.status = "pause"
            const result = await this._postRepo.update(id, updateFields)
            return result
        }
        return "Permission is required"
    }

    public async getPostCountForEmployer(token: string): Promise<{ data: {}, message: string, status: number }> {
        const userInfo = this._jwtToken.getUserInfo(token)
        if (userInfo.permission.includes('statistic.all')) {
            const postCount = await this._postRepo.getPostCountByCondition({})
            const introductionCount = await this._introductionRepo.getIntroductionCountByCondition({})
            const activePostCount = await this._postRepo.getPostCountByCondition({ status: 'active' })
            const acceptIntroduceCount = await this._introductionRepo.getIntroductionCountByCondition({ status: 'Company Accept' })
            const interviewIntroduceCount = await this._introductionRepo.getIntroductionCountByCondition({ status: 'Interviewed' })
            const result = {
                post: {
                    total: postCount,
                    active: activePostCount
                },
                introduction: {
                    total: introductionCount,
                    accept: acceptIntroduceCount,
                    interviewed: interviewIntroduceCount
                }
            }
            return { data: result, message: "Success", status: 0 }
        } else {
            return { data: null, message: "Permission is required", status: 1 }
        }
    }

    public async getPostCountForCollaborator(token: string): Promise<{ data: {}, message: string, status: number }> {
        const userInfo = this._token.getUserInfo(token)
        const listCandidate = await this._candidateRepo.findByCondition({ collaborator_id: userInfo.id })
        let candidateIds = []
        listCandidate.map(candidate => candidateIds.push(candidate._id.toString()))
        const listIntroduction = await this._introductionRepo.findByCondition({ candidate_id: { $in: candidateIds } })
        const introductionCount = listIntroduction.length
        let postIds = []
        let acceptIntroduceCount = 0
        let interviewIntroduceCount = 0
        for (let introduction of listIntroduction) {
            if (!postIds.includes(introduction.post_id)) {
                postIds.push(introduction.post_id)
            }
            const statusHistories = await this._statusHistoryRepo.getStatusHistories({ candidate_introduction_id: introduction._id.toString() },
                { time: -1 })
            if (statusHistories[0].status === 'Company Accept') {
                acceptIntroduceCount++
            } else if (statusHistories[0].status === 'Interviewed') {
                interviewIntroduceCount++
            }
        }
        const listPost = await this._postRepo.findByCondition({ _id: { $in: postIds } })
        const postCount = listPost.length
        let activePostCount = 0
        for (let post of listPost) {
            if (post.status === 'active') {
                activePostCount++
            }
        }
        const result = {
            post: {
                total: postCount,
                active: activePostCount
            },
            introduction: {
                total: introductionCount,
                accept: acceptIntroduceCount,
                interviewed: interviewIntroduceCount
            },
            candidate: {
                total: listCandidate.length
            }
        }
        return { data: result, message: "Success", status: 0 }

    }

    public async getQuestionPackages(token: string): Promise<{ data: string[], message: string, status: number }> {
        let result = []
        const userInfo = this._jwtToken.getUserInfo(token)
        if (userInfo.permission.includes('post.all') || userInfo.permission.includes('post.create') || userInfo.permission.includes('post.update')) {
            const services = await this._inviteTestService.getQuestionPackageIds()
            if (services.length > 0) {
                for (let service of services) {
                    const packages = await this._inviteTestService.getQuestionPackages(service['question_packages'])
                    for (let packageRecord of packages) {
                        packageRecord['service_id'] = service['_id']
                        result.push(packageRecord)
                    }
                }
            }
            return { data: result, message: "Success", status: 0 }
        } else {
            return { data: [], message: "Permission is required", status: 1 }
        }
    }
}