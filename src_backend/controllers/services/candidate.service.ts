import { inject, injectable } from "inversify";
import { Candidate, RequestCreateCandidate, RequestSelfAppliedCandidate, RequestUpdateCandidate } from "../../entities/candidate";
import { IPdfHandler } from "../../FileHandle/PdfHandler";
import { Token } from "../../JwtToken/JwtToken";
import { ICandidateRepository } from "../../repositories/candidate.repository";
import { ICandidateIntroductionRepository } from "../../repositories/candidate_introduction.repository";
import { ICandidateSkillRepository } from "../../repositories/candidate_skill.repository";
import { ICityRepository } from "../../repositories/city.repository";
import { IFileRepository } from "../../repositories/file.repository";
import { IIndustryRepository } from "../../repositories/industry.repository";
import { IJobRoleRepository } from "../../repositories/job_role.repository";
import { ILanguageRepository } from "../../repositories/language.repository";
import { IPostRepository } from "../../repositories/post.repository";
import { ISkillRepository } from "../../repositories/skill.repository";
import { CandidateStatus, CollaboratorStatus, Constants, IntroductionStatus} from '../../common/constants'
import { TYPES } from "../../types";
import fs from 'fs'
import pdfparse from 'pdf-parse'
import path from 'path'
import { IDocxHandler } from "../../FileHandle/DocxHandler";
import { ICandidateWorkExperienceRepository } from "../../repositories/work_experience.repository";
import { ICandidateLanguageRepository } from "../../repositories/candidate_language.repository";
import { File } from "../../entities/file";
import { CandidateIntroduction } from "../../entities/candidate_introduction";
import { OptionalFieldsValue } from "../../entities/optional_fields_value";
import { IOptionalFieldValueRepository } from "../../repositories/optional_field_value.repository";
import { IOptionalFieldRepository } from "../../repositories/optional_field.repository";
import { IUserRepository } from "../../repositories/user.repository";
import { IHtmlHandler } from "../../FileHandle/HtmlHandler";
import { ICandidateIntroductionStatusHistoryRepository } from "../../repositories/candidate_introduction_status_history.repository";
import { CandidateIntroductionStatusHistory, CandidateIntroductionStatusHistoryModel } from "../../entities/candidate_introduction_status_history";
import { IWarrantyRepository } from "../../repositories/warranty.repository";
import { ObjectId } from "mongodb";


export interface ICandidateService {
    searchCandidate(bearerToken: string, condition, pageIndex: number, pageSize: number, sortBy: number): Promise<{
        pageIndex: number,
        pageSize: number,
        totalPages: number,
        totalCount: number,
        candidates: any[]
    }>
    searchCandidateToMatch(bearerToken: string, condition, pageIndex: number, pageSize: number): Promise<{
        pageIndex: number,
        pageSize: number,
        totalPages: number,
        totalCount: number,
        candidates: any[]
    }>
    getCandidateDetailForCollab(bearerToken: string, id: string): Promise<{ data: {}, status: number, message: string }>
    uploadcv(file: any): Promise<{ pathOriginal: string, pathHided: string, message: string, status: number, email: string, phone: string }>
    createCandidate(bearerToken: string, candidate: RequestCreateCandidate): Promise<{ id: string, message: string, status: number }>
    removeCandidate(bearerToken: string, candidateId: string): Promise<{ message: string, status: number }>
    updateStatusCandidate(bearerToken: string, candidateId: string, status: string): Promise<{ candidateStatus: string, message: string, status: number }>
    referCandidate(bearerToken: string, candidateId: string, postId: string, optionalFieldsValue: any[]): Promise<{ candidateIntroductionId: string, message: string, status: number }>
    updateCandidate(bearerToken: string, candidate: RequestUpdateCandidate):Promise<{message: string, status: number}>
    updateCv(bearerToken: string,file: any, candidateId: string): Promise<{pathOriginal: string, pathHided: string, message: string, status: number, email: string, phone: string}>
    referByCandidate(requestCandidate: RequestSelfAppliedCandidate): Promise<{message: string, status: number}>
    downloadCvFile(bearerToken: string, candidateId: string): Promise<{path: string,message: string, status: number}>
}

@injectable()
export class CandidateService implements ICandidateService {
    @inject(TYPES.ICandidateRepository) private readonly _candidateRepo: ICandidateRepository
    @inject(TYPES.Token) private readonly _jwtToken: Token
    @inject(TYPES.IFileRepository) private readonly _fileRepo: IFileRepository
    @inject(TYPES.ILanguageRepository) private readonly _langRepo: ILanguageRepository
    @inject(TYPES.IPostRepository) private readonly _postRepo: IPostRepository
    @inject(TYPES.IPdfHandler) private readonly _pdfHandler: IPdfHandler
    @inject(TYPES.ISkillRepository) private readonly _skillRepo: ISkillRepository
    @inject(TYPES.ICityRepository) private readonly _cityRepo: ICityRepository
    @inject(TYPES.IJobRoleRepository) private readonly _jobRoleRepo: IJobRoleRepository
    @inject(TYPES.ICandidateSkillRepository) private readonly _candidateSkillRepo: ICandidateSkillRepository
    @inject(TYPES.IIndustryRepository) private readonly _industryRepo: IIndustryRepository
    @inject(TYPES.ICandidateWorkExperienceRepository) private readonly _candidateWorkExperienceRepo: ICandidateWorkExperienceRepository
    @inject(TYPES.ICandidateLanguageRepository) private readonly _candidateLanguageRepository: ICandidateLanguageRepository
    @inject(TYPES.ICandidateIntroductionRepository) private readonly _candidateIntroductionRepo: ICandidateIntroductionRepository
    @inject(TYPES.IOptionalFieldValueRepository) private readonly _optionalFieldValueRepo: IOptionalFieldValueRepository
    @inject(TYPES.IOptionalFieldRepository) private readonly _optionalFieldRepo: IOptionalFieldRepository
    @inject(TYPES.IUserRepository) private readonly _userRepo: IUserRepository
    @inject(TYPES.ICandidateIntroductionStatusHistoryRepository) private readonly _candidateStatusHistoryRepo: ICandidateIntroductionStatusHistoryRepository
    @inject(TYPES.IWarrantyRepository) private readonly _warrantyRepo: IWarrantyRepository
    @inject(TYPES.IDocxHandler) private readonly _docxHandler: IDocxHandler
    @inject(TYPES.IHtmlHandler) private readonly _htmlHandler: IHtmlHandler

    public async searchCandidateToMatch(bearerToken: string, condition, pageIndex: number, pageSize: number): Promise<{
        pageIndex: number,
        pageSize: number,
        totalPages: number,
        totalCount: number,
        candidates: any[]
    }>{
        
        const userData = this._jwtToken.getUserInfo(bearerToken)
        const collaborator = await this._userRepo.getById(userData.id)
        const offset = pageIndex * pageSize
        if(collaborator.status === 'approval'){
            if (condition.salary_to === undefined && condition.salary_from === undefined) { // search all, salary ok
                delete condition.salary_to
                delete condition.salary_from
            } else if (condition.salary_to === undefined && condition.salary_from !== undefined) { // chon cai lon nhat
                condition.salary_from = { $gte: condition.salary_from }
                delete condition.salary_to
            } else {
                condition.salary_from = { $gte: condition.salary_from, $lte: condition.salary_to }
                delete condition.salary_to
            }
            if (condition.date_created_to !== undefined && condition.date_created_from !== undefined) { // search gt lt
                condition.date_created = { $gte: condition.date_created_from, $lte: condition.date_created_to }
            } else if(condition.date_created_to === undefined && condition.date_created_from !== undefined) {// search gt
                condition.date_created = { $gte: condition.date_created_from }
            }else if(condition.date_created_to !== undefined && condition.date_created_from === undefined){ // search lt
                condition.date_created = { $lte: condition.date_created_to }
            }
            delete condition.date_created_to
            delete condition.date_created_from

            const keyWordCvRequire = condition.keyword_cv // chuoi
            
            const keywordWithoutAccents = this._pdfHandler.removeAccents(keyWordCvRequire).toLowerCase()
            // let keywordWithoutAccentsRegex  = keywordWithoutAccents.replace(/,/g,'|')
            // let keywordRegex  = keyWordCvRequire.replace(/,/g,'|')

            let keywordWithoutAccentsRegex: string = ''
            let keywordRegex: string = ''
            let listKeyword = keyWordCvRequire.split(',')
            let listKeywordWithoutAccents = keywordWithoutAccents.split(',')

            for(let tmp = 0; tmp < listKeyword.length; tmp++){
                if((tmp + 1) === listKeyword.length){
                    keywordRegex += listKeyword[tmp].trim() 
                    keywordWithoutAccentsRegex += listKeywordWithoutAccents[tmp].trim()
                }else{
                    keywordRegex += listKeyword[tmp].trim() + '|' 
                    keywordWithoutAccentsRegex += listKeywordWithoutAccents[tmp].trim() + '|'
                }
            }
            condition.content_cv_clean = { $regex: keywordWithoutAccentsRegex, $options: 'i' } 
            delete condition.keyword_cv
    
            if (condition.currency === '0') {
                delete condition.currency
            }
            if (condition.city_ids === '0') { //  city ok
                delete condition.city_ids
            } else {
                const listCity = condition.city_ids.split(',')
                condition.city_ids = { $in: listCity }
            }
            let sort = {
                date_created: -1
            }
            condition['collaborator_id'] = userData.id
            condition['is_disable'] = false
            condition['status'] = CandidateStatus.LOOKINGJOB
            let listCandidateId = await this._candidateRepo.getListIdByCondition(condition)
            let listObjectId = listCandidateId.map(function(id) { return new ObjectId(id); });
            let condition2 = {
                content_cv: { $regex: keywordRegex, $options: 'i' },
                _id: {$in: listObjectId}
            }
            const result = await this._candidateRepo.findByConditionAndPaging(condition2, offset, pageSize, sort)
            let listCandidate = result.data
            //listCandidate = listCandidate.filter((candidate: Candidate) => new RegExp(keywordRegex, 'i').test(candidate.content_cv))
            let listCandidateReturn = []
            for (let candidate of listCandidate) {
                const cv = await this._fileRepo.getById(candidate.cv_id)
                let cities: string[] = []
                for(let cityId of candidate.city_ids){
                    const city = await this._cityRepo.getById(cityId)
                    if(city !== null){
                        cities.push(city.title)
                    }
                }
                let pathFile = ''
                if(cv !== null){
                    pathFile= cv.path
                    const filename = path.basename(pathFile)
                    pathFile = Constants.pathStaticFixedCv + filename
                }
                const dto = {
                    id: '' + candidate._id,
                    name: candidate.name,
                    profile_title: candidate.profile_title,
                    created_date: candidate.date_created,
                    salary_from: candidate.salary_from,
                    salary_to: candidate.salary_to,
                    negotiable: candidate.negotiable,
                    currency : candidate.currency,
                    email: candidate.email,
                    phone: candidate.phone,
                    cities,
                    cv: pathFile,
                    status: candidate.status
                }
                listCandidateReturn.push(dto)
            }
    
            const dtoReturn = {
                pageIndex,
                pageSize,
                totalPages: result.infoPaging.totalPages,
                totalCount: result.infoPaging.totalDocs,
                candidates: listCandidateReturn
            }
            return dtoReturn
        }
        return{
            pageIndex: 0,
            pageSize: 0,
            totalPages: 0,
            totalCount: 0,
            candidates: []
        }
    }

    public async searchCandidate(bearerToken: string, condition, pageIndex: number, pageSize: number, sortBy: number): Promise<{
        pageIndex: number,
        pageSize: number,
        totalPages: number,
        totalCount: number,
        candidates: any[]
    }> {
        const userData = this._jwtToken.getUserInfo(bearerToken)
        const offset = pageSize * pageIndex
        if (condition.salary_to === undefined && condition.salary_from === undefined) { // search all, salary ok
            delete condition.salary_to
            delete condition.salary_from
        } else if (condition.salary_to === undefined && condition.salary_from !== undefined) { // chon cai lon nhat
            condition.salary_from = { $gte: condition.salary_from }
            delete condition.salary_to
        } else {
            condition.salary_from = { $gte: condition.salary_from, $lte: condition.salary_to }
            delete condition.salary_to
        }
        if (condition.date_created_to !== undefined && condition.date_created_from !== undefined) { // search gt lt
            condition.date_created = { $gte: condition.date_created_from, $lte: condition.date_created_to }
        } else if(condition.date_created_to === undefined && condition.date_created_from !== undefined) {// search gt
            condition.date_created = { $gte: condition.date_created_from }
        }else if (condition.date_created_to !== undefined && condition.date_created_from === undefined){ // search lt
            condition.date_created = { $lte: condition.date_created_to }
        }
        delete condition.date_created_to
        delete condition.date_created_from
        if(condition.keyword_cv_require === undefined){
            condition.keyword_cv_require = ''
        }
        // search ko dấu trước
        const keywordWithoutAccents = this._pdfHandler.removeAccents(condition.keyword_cv_require).toLowerCase()
        condition.content_cv_clean = { $regex: keywordWithoutAccents, $options: 'i' } 
           // delete condition.keyword_cv_optional
        const keyWordCvRequire = condition.keyword_cv_require
        

        delete condition.keyword_cv_require
        //delete condition.keyword_cv_optional
        if (condition.currency === '0') {
            delete condition.currency
        }
        if (condition.city_ids === '0') { //  city ok
            delete condition.city_ids
        } else {
            const listCity = condition.city_ids.split(',')
            condition.city_ids = { $in: listCity }
        }
        let postId = condition.postId
        if(condition.postId !== undefined){
            //condition.post_ids = {$ne: condition.postId}
            condition.status = CandidateStatus.LOOKINGJOB
        }
        delete condition.postId
        let sort = {};
        if (sortBy === 0) {
            sort['_id'] = -1

        } else if (sortBy === 1) {
            sort['name'] = 1
        }
        else if (sortBy === 2) {
            sort['profile_title'] = 1
        } else if (sortBy === 3) { // sort by status
            sort['status'] = 1
        }

        condition['collaborator_id'] = userData.id
        condition['is_disable'] = false
        let listCandidateIdTmp = await this._candidateRepo.getListIdByCondition(condition)
        let listCandidateIdAvailaleToRefer = []
        if(postId !== undefined){ // search de refer thì mới check 
            for(let candidateId of listCandidateIdTmp){
                const candidateIntroduction = await this._candidateIntroductionRepo.findByCondition({candidate_id: candidateId})
                const check = candidateIntroduction.find(c => c.post_id === postId)
                if(check === undefined){ // nếu candidate này chưa giới thiệu cho post này 
                    if(candidateIntroduction.length !== 0){
                        const lastIntroduction = candidateIntroduction[(candidateIntroduction.length -1)]
                        const newestStatus = await this._candidateStatusHistoryRepo.getNewestStatus(lastIntroduction._id.toString())
                        const regexStatus = /^(Employer Accept)|(Company Viewed)|(Company Accept)|(Send Test)|(Candidate Submit Test)|(Passed Test)|(Schedule Interview)|(Interviewed)|(Offer)|(Onboard)|(Pending)$/
                        if(!regexStatus.test(newestStatus.status)){
                            listCandidateIdAvailaleToRefer.push(candidateId)
                        }
                    }else{
                        listCandidateIdAvailaleToRefer.push(candidateId)
                    }
                }
            }
        }else{
            listCandidateIdAvailaleToRefer = listCandidateIdTmp
        }
        let listObjectId = listCandidateIdAvailaleToRefer.map(function(id) { return new ObjectId(id)});
        let condition2 = {
            content_cv: { $regex: keyWordCvRequire, $options: 'i' },
            _id: {$in: listObjectId}
        }
        const result = await this._candidateRepo.findByConditionAndPaging(condition2, offset, pageSize, sort)
        let listCandidate = result.data
        let listCandidateReturn = []
        for (let candidate of listCandidate) {
            const cv = await this._fileRepo.getById(candidate.cv_id)
            let path = ''
            if(cv !== null){
                path = Constants.pathStaticFixedCv + cv.name
            }
            let allowDelete = true
            const listIntroduction = await this._candidateIntroductionRepo.findByCondition({candidate_id: candidate._id.toString()})
            if(listIntroduction.length !== 0){
                allowDelete = false
            }
            const dto = {
                id: '' + candidate._id,
                name: candidate.name,
                profile_title: candidate.profile_title,
                created_date: candidate.date_created,
                salary_from: candidate.salary_from,
                salary_to: candidate.salary_to,
                negotiable: candidate.negotiable,
                email: candidate.email,
                phone: candidate.phone,
                currency : candidate.currency,
                cv: path,
                status: candidate.status,
                allowDelete
            }
            listCandidateReturn.push(dto)
        }
        const dtoReturn = {
            pageIndex,
            pageSize,
            totalPages: result.infoPaging.totalPages,
            totalCount: result.infoPaging.totalDocs,
            candidates: listCandidateReturn
        }
        return dtoReturn
    }



    public async createCandidate(bearerToken: string, candidateRequestDto: RequestCreateCandidate): Promise<{ id: string, message: string, status: number }> {
        const userData = this._jwtToken.getUserInfo(bearerToken);
        const collaborator = await this._userRepo.getById(userData.id)
        if(collaborator.status === 'approval'){
            const candidate = new Candidate()
            candidate.collaborator_id = userData.id
            for(let cityId of candidateRequestDto.city_ids){
                const city = await this._cityRepo.getById(cityId)
                if(city !== null){
                    if(city.status !== 'publish'){
                        // error   
                        return {id: '', message: 'The city with id '+cityId+' is not available ', status: 2}
                    }
                }else{
                    return {id: '', message: 'The city with id '+cityId+' is not found ', status: 1}
                }
            }
            candidate.city_ids = candidateRequestDto.city_ids

            const jobRoleIds = candidateRequestDto.job_role_ids
            candidate.job_role_ids = []
            if(jobRoleIds !== null){
                for(let jobRoleId of jobRoleIds){
                    const jobRole = await this._jobRoleRepo.getById(jobRoleId)
                    if(jobRole !== null){
                        if(jobRole.status !== 'publish'){
                            // error   
                            return {id: '', message: 'The job role with id '+jobRoleId+' is not available ', status: 2}
                        }
                    }else{
                        return {id: '', message: 'The job role with id '+jobRoleId+' is not found ', status: 1}
                    }
                }
                candidate.job_role_ids = candidateRequestDto.job_role_ids
            }  
            
            const candidateSkills = candidateRequestDto.candidate_skills
            if(candidateSkills !== null){
                for(let candidateSkill of candidateSkills){                
                    const skill = await this._skillRepo.getById(candidateSkill.skill_id)
                    if(skill === null){
                        return {id: '', message: 'The skill with id '+candidateSkill.skill_id+' is not found ', status: 1}
                    }
                    
                }
            }
            
            const workExperiences = candidateRequestDto.work_experiences 
            if(workExperiences !== null){
                for(let workExperience of workExperiences){
                    for(let industryId of workExperience.industry_ids){
                        const checkIndustryInWorkExperience = await this._industryRepo.getById(industryId)
                        if(checkIndustryInWorkExperience !== null){
                            if(checkIndustryInWorkExperience.status !== 'publish'){
                                return {id: '', message: 'The industry with id '+industryId+' is not available ', status: 2}
                            }
                            // error
                        }else{
                            return {id: '', message: 'The industry with id '+industryId+' is not found ', status: 1}
                        }
                    }
                    for(let jobRoleId of workExperience.job_role_ids){
                        const jobRole = await this._jobRoleRepo.getById(jobRoleId)
                        if(jobRole !== null){
                            if(jobRole.status !== 'publish'){
                                // error   
                                return {id: '', message: 'The job role with id '+jobRoleId+' is not available ', status: 2}
                            }
                        }else{
                            return {id: '', message: 'The job role with id '+jobRoleId+' is not found ', status: 1}
                        }
                    }   
                }
            }
            
            const candidateLanguages = candidateRequestDto.candidate_languages
            if(candidateLanguages !== null){   
                for(let language of candidateLanguages){
                    const checkLanguageExsited = await this._langRepo.getById(language.language_id)
                    if(checkLanguageExsited !== null){
                        if(checkLanguageExsited.is_disable){
                            // error   
                            return {id: '', message: 'The language with id '+language.language_id+' is not available ', status: 2}
                        }
                    }else{
                        return {id: '', message: 'The language with id '+language.language_id+' is not found ', status: 1}
                    }
                }
            }
            const candidateAvailability = candidateRequestDto.candidate_availability
            switch (candidateAvailability) {
                case "0":
                    candidate.candidate_availability = 'có thể nhận ngay'
                    break;
                case "1": 
                    candidate.candidate_availability = 'sau 1 tháng'
                    break;
                case "2":
                    candidate.candidate_availability = 'sau 2 tháng'
                    break;
                case "3":
                    candidate.candidate_availability = 'sau 3 tháng'
                    break;
                default:
                    break;
            }

            if(candidateRequestDto.job_levels !== null){
                candidate.job_levels = candidateRequestDto.job_levels.toString()
            }            
            let currentDate = new Date();
            currentDate.setHours(0,0,0,0)
            candidate.date_created = currentDate.getTime()

            candidate.name = candidateRequestDto.name;
            candidate.email = candidateRequestDto.email;
            candidate.phone = candidateRequestDto.phone;
            //candidate.link_cv = candidateRequestDto.path_cv_fixed;
            if( candidateRequestDto.salary_from !== null){
                candidate.salary_from = candidateRequestDto.salary_from;
            }
            if( candidateRequestDto.salary_to !== null){
                candidate.salary_to = candidateRequestDto.salary_to;
            }
            if(candidateRequestDto.current_salary !== null){
                candidate.current_salary = candidateRequestDto.current_salary
            }
            candidate.currency = candidateRequestDto.currency
            candidate.profile_title = candidateRequestDto.profile_title;
            candidate.candidate_expectation = candidateRequestDto.candidate_expectation;
            candidate.negotiable = candidateRequestDto.negotiable;
            
            if(candidateRequestDto.current_salary !== null){
                candidate.current_salary = candidateRequestDto.current_salary
            }
           
            candidate.suitable_reason = candidateRequestDto.suitable_reason
            candidate.candidate_expectation = candidate.candidate_expectation
            const filename = path.basename(candidateRequestDto.path_cv_hided) // get filename
           
        
            const path_tmp_cv_original = Constants.pathTmpOriginalCv + filename
            if(!fs.existsSync(path_tmp_cv_original)){
                return {id: '', message: 'The path cv hided is not existed', status: 1}
            }
            let dataBuffer = fs.readFileSync(path_tmp_cv_original)
            // doc pdf
            
            let contentCv = '';
            const extname = path.extname(candidateRequestDto.path_cv_hided) 
            if(extname === '.pdf'){ // doc pdf
                const dataCv = await pdfparse(dataBuffer)
                contentCv = dataCv.text;
            }else if(extname === '.html'){
                contentCv = await this._htmlHandler.extractText(path_tmp_cv_original)
            }
            else if(extname === '.docx'){
               const resultReadDocx = await this._docxHandler.extractText(path_tmp_cv_original)
               if(resultReadDocx.status === 0){
                   contentCv = resultReadDocx.content
               }else{
                    return {id: '', message: 'Library Error', status: resultReadDocx.status} 
               }
            }
            //application/vnd.openxmlformats-officedocument.wordprocessingml.document
            
            //candidate.content_cv = contentCv.toLowerCase().trim().replace(/\r?\n|\r/g,' ')
            candidate.content_cv = contentCv.trim()
            candidate.is_disable = false
            candidate.content_cv_clean = this._pdfHandler.removeAccents(contentCv).toLowerCase().trim().replace(/\r?\n|\r/g,' ')
            
            candidate.date_created = new Date().setHours(0,0,0,0)
            candidate.status = CandidateStatus.LOOKINGJOB
            const resultCreateCandidate = await this._candidateRepo.create(candidate)
            let listCandidateSkillId: string[] = []
            let listWorkExperienceId: string[] = []
            let listLanguageId: string[] = []
            if(candidateSkills !== null){
                for(let candidateSkill of candidateRequestDto.candidate_skills){
                    candidateSkill.candidate_id = resultCreateCandidate._id
                    const resultCandidateSkill = await this._candidateSkillRepo.create(candidateSkill)
                    listCandidateSkillId.push(resultCandidateSkill._id.toString())
                }
            }
            
            if(workExperiences !== null){
                for(let workExperience of candidateRequestDto.work_experiences){
                    workExperience.candidate_id = resultCreateCandidate._id
                    const resultWorkExperience =  await this._candidateWorkExperienceRepo.create(workExperience)
                    listWorkExperienceId.push(resultWorkExperience._id.toString())
                }
            }
            if(candidateLanguages !== null){
                for(let language of candidateRequestDto.candidate_languages){
                    language.candidate_id = resultCreateCandidate._id
                    const resultLanaguage = await this._candidateLanguageRepository.create(language)
                    listLanguageId.push(resultLanaguage._id.toString())
                }
            }
            const pathHide = Constants.pathTmpFixedCv +filename
            fs.renameSync(pathHide, Constants.pathFixedCv+filename)
            fs.renameSync(path_tmp_cv_original, Constants.pathOriginalCv+filename)
            
            let file = new File()
            file.path = Constants.pathFixedCv+filename
            file.extension = extname.replace('.','')
            file.name = filename
            file.type = file.extension
            file.user_id = userData.id

            const resultCreateFile = await this._fileRepo.create(file)
            await this._candidateRepo.update(resultCreateCandidate._id,
                {candidate_skills_ids: listCandidateSkillId,
                 candidate_languages_ids: listLanguageId,
                 work_experiences_ids: listWorkExperienceId,
                 cv_id: resultCreateFile._id
                })

            return {id: resultCreateCandidate._id, message: 'Success', status: 0}
            
        }
        return {id: '', message: 'The collaborator is not approval', status: 2}
    }

    public async updateCv(bearerToken: string, file: any, candidateId: string): Promise<{pathOriginal: string, pathHided: string, message: string, status: number, email: string, phone: string}>{
        const userData = this._jwtToken.getUserInfo(bearerToken)
        const collaborator = await this._userRepo.getById(userData.id)
        if(collaborator.status ==='approval'){
            const candidate = await this._candidateRepo.getById(candidateId)
            if(candidate !== null){
                if(candidate.collaborator_id === userData.id){
                    const listIntroduction = await this._candidateIntroductionRepo.findByCondition({candidate_id: candidate._id.toString()})
                    for(let i of listIntroduction){
                        const listIntroductionHistory = await this._candidateStatusHistoryRepo.findByCondition({candidate_introduction_id: i._id.toString()})
                        const regexStatus = /^(Pending)|(Employer Accept)|(Company Viewed)|(Company Accept)|(Send Test)|(Candidate Submit Test)|(Passed Test)|(Schedule Interview)|(Interviewed)|(Offer)|(Onboard)$/
                        const check = listIntroductionHistory.find(h => regexStatus.test(h.status))
                        if(check !== undefined){ // neu dag trong qua trình pv thì không dc đổi 
                            return {
                                pathOriginal: '',
                                pathHided: '',
                                message: 'Can not update this candidate',
                                status: 4,
                                email: '',
                                phone: ''
                            }
                        }
                    }
                    if(!candidate.is_disable){
                        const cvFile = await this._fileRepo.getById(candidate.cv_id)
                        if(cvFile !== null){
                            const pathFile :string = file.path
                            const fixedPathFile = Constants.pathFixedCv + cvFile.name
                            const orignalPathFile = Constants.pathOriginalCv + cvFile.name
                            //application/vnd.openxmlformats-officedocument.wordprocessingml.document
                            const originalFileName: string = file.originalname
                            const extname = path.extname(pathFile) 
                            const extension = extname.replace('.','')
                            let result = null
                            let contentCv = '';
                           
                            if(extname === '.pdf'){
                                result =  await this._pdfHandler.hideInfo(pathFile,originalFileName, true)
                                let dataBuffer = fs.readFileSync(result.pathOriginal)
                                const dataCv = await pdfparse(dataBuffer)
                                contentCv = dataCv.text;
                            }else if (extname === '.html'){
                                result = await this._htmlHandler.hideUserInfoInHtml(pathFile, true)
                                contentCv = this._htmlHandler.extractText(result.pathOriginal)
                            }else if(extname === '.docx'){
                                result = await this._docxHandler.hideUserInfoInDocx(pathFile, true)
                                const resultReadDocx = await this._docxHandler.extractText(result.pathOriginal)
                                if(resultReadDocx.status === 0){
                                    contentCv = resultReadDocx.content
                                }else{
                                     return {
                                         pathOriginal: '',
                                         pathHided: '',
                                         message: resultReadDocx.message,
                                         status: resultReadDocx.status,
                                         email: '',
                                         phone: ''
                                     }
                                }
                            }
                            const pathHided = result.pathHided
                            const filename = path.basename(pathHided)
                            const fileType = extension
                            await this._fileRepo.update(cvFile._id,{path: pathHided,extension, name: filename, type: fileType})
                            const contentCvClean = this._pdfHandler.removeAccents(contentCv).toLowerCase().trim().replace(/\r?\n|\r/g,' ')
                            await this._candidateRepo.update(candidate._id,{content_cv: contentCv, content_cv_clean: contentCvClean})
                            fs.unlinkSync(fixedPathFile)
                            fs.unlinkSync(orignalPathFile)
                            result.pathHided = Constants.pathStaticFixedCv + filename
                            result.pathOriginal = Constants.pathStaticOriginalCv + filename
                            return result
                        }
                        return {
                            pathOriginal: '',
                            pathHided: '',
                            message: 'Can not found cv file of the candidate',
                            status: 1,
                            email: '',
                            phone: ''
                        }
                    }
                    return {
                        pathOriginal: '',
                        pathHided: '',
                        message: 'The candidate is disable',
                        status: 2,
                        email: '',
                        phone: ''
                    }
                }
                return {
                    pathOriginal: '',
                    pathHided: '',
                    message: 'The candidate is not belong to this collaborator',
                    status: 3,
                    email: '',
                    phone: ''
                }
            }
            return {
                pathOriginal: '',
                pathHided: '',
                message: 'The candidate is not found',
                status: 1,
                email: '',
                phone: ''
            }
        }
        return {
            pathOriginal: '',
            pathHided: '',
            message: 'The collaborator is not approval',
            status: 2,
            email: '',
            phone: ''
        }
        
        
    }

    public async uploadcv(file: any): Promise<{pathOriginal: string, pathHided: string, message: string, status: number, email: string, phone: string}>{
        let pathFile :string = file.path
        pathFile = './' +pathFile.replace(/[\\]/g,"/")
        //application/vnd.openxmlformats-officedocument.wordprocessingml.document
        const originalFileName: string = file.originalname
        let result = null
        if(file.mimetype === 'application/pdf'){
            result =  await this._pdfHandler.hideInfo(pathFile,originalFileName,false)
        }else if (file.mimetype === 'text/html'){
           // const text = this._htmlHandler.extractText(pathFile)
            result =  this._htmlHandler.hideUserInfoInHtml(pathFile,false)
        }
        else {
            result = this._docxHandler.hideUserInfoInDocx(pathFile,false)
        }
        const filename = path.basename(result.pathHided)
        result.pathHided = '/static/tmp_cv/'+filename
        result.pathOriginal = '/static/tmp_original_cv/'+filename
        
        return result
    }
    public async updateStatusCandidate(bearerToken: string, candidateId: string, status: string): Promise<{ candidateStatus: string, message: string, status: number }> {
        const userData = await this._jwtToken.getUserInfo(bearerToken);
        const collaborator = await this._userRepo.getById(userData.id)
        if(collaborator.status === 'approval'){
            const candidate = await this._candidateRepo.getById(candidateId)
                if(candidate !== null){
                    if(!candidate.is_disable){
                        if(candidate.collaborator_id === userData.id){
                            if(status === '1'){
                                status = CandidateStatus.LOOKINGJOB
                            }else if(status ==='2'){
                                status = CandidateStatus.HADJOB
                            }
                            await this._candidateRepo.update(candidateId, { status })
                            return { candidateStatus: status, message: 'Success', status: 0 }
                        }
                        return { candidateStatus: '', message: 'The candidate is not belong to this collaborator', status: 1 }
                    }
                    return { candidateStatus: '', message: 'The candidate is disable', status: 2 }
                }
                return { candidateStatus: '', message: 'Cant not found the candidate', status: 3 }
        }
        return { candidateStatus: '', message: "The collaborator is not approval", status: 2 }
    }

    public async removeCandidate(bearerToken: string, candidateId: string): Promise<{ message: string, status: number }> {
        const userData = await this._jwtToken.getUserInfo(bearerToken);
        const collaborator = await this._userRepo.getById(userData.id)
        if(collaborator.status === 'approval'){
            const candidate = await this._candidateRepo.getById(candidateId)
            if(candidate !== null){
                if(candidate.collaborator_id === userData.id){
                    if(!candidate.is_disable){
                        const listIntroduction = await this._candidateIntroductionRepo.findByCondition({candidate_id: candidate._id.toString()})
                        if(listIntroduction.length !== 0){
                            return { message: 'Can not remove this candidate because this candidate was reffered', status: 4 }
                        }
                        await this._candidateRepo.update(candidateId, { is_disable: true })
                        return { message: 'Success', status: 0 }
                    }
                    return {message: 'The candidate is disable', status: 1 }
                }
                return {message: 'The candidate is not belong to this collaborator', status: 2 }
            }
            return {message: 'Cant not found the candidate', status: 3 }
        }
        return { message: "The collaborator is not approval", status: 1 }
    }


    
    public async getCandidateDetailForCollab(bearerToken: string ,id: string): Promise<{ data: {}, status: number, message: string }> {
        const collaborator = this._jwtToken.getUserInfo(bearerToken) 
        const result = await this._candidateRepo.getById(id)
        if (result !== null && result.is_disable === false && result.collaborator_id === collaborator.id) {
            const cvRecord = await this._fileRepo.getById(result.cv_id)
            cvRecord.path = Constants.pathStaticFixedCv + cvRecord.name
            delete result.cv_id
            result['cv'] = cvRecord
            result['cv_original_path'] = Constants.pathStaticOriginalCv + cvRecord.name
            const listJobRole = []
            const cities = []
            const skills = []
            const languages = []
            const workExps = []
            //delete result.post_ids
            for (let jobRoleId of result.job_role_ids) {
                const jobRole = await this._jobRoleRepo.getById(jobRoleId)
                listJobRole.push({ id: jobRole._id, name: jobRole.name })
            }
            delete result.job_role_ids
            result['job_roles'] = listJobRole
            for (let cityId of result.city_ids) {
                const city = await this._cityRepo.getById(cityId)
                cities.push({ id: city._id, name: city.title })
            }
            delete result.city_ids
            result['cities'] = cities
            for (let skillId of result.candidate_skills_ids) {
                const candidateSkill = await this._candidateSkillRepo.getById(skillId)
                const skill = await this._skillRepo.getById(candidateSkill.skill_id)
                delete candidateSkill.candidate_id
                delete candidateSkill.skill_id
                candidateSkill['skill'] = skill
                skills.push(candidateSkill)
            }
            delete result.candidate_skills_ids
            result['candidate_skills'] = skills
            for (let languageId of result.candidate_languages_ids) {
                const candidateLanguage = await this._candidateLanguageRepository.getById(languageId)
                const language = await this._langRepo.getById(candidateLanguage.language_id)
                delete candidateLanguage.candidate_id
                delete candidateLanguage.language_id
                candidateLanguage['language'] = language
                languages.push(candidateLanguage)
            }
            delete result.candidate_languages_ids
            result['candidate_languages'] = languages

            for (let workExpId of result.work_experiences_ids) {
                const workExp = await this._candidateWorkExperienceRepo.getById(workExpId)
                let industries = []
                for(let industryId of workExp.industry_ids){
                    const industry = await this._industryRepo.getById(industryId)
                    industries.push(industry)
                }
                delete workExp.industry_ids
                workExp['industries'] = industries
                let jobRoles = []
                for(let jobRoleId of workExp.job_role_ids){
                    const jobRole = await this._jobRoleRepo.getById(jobRoleId)
                    jobRoles.push(jobRole)
                }
                delete workExp.job_role_ids
                delete workExp.candidate_id
                workExp['job_roles'] = jobRoles
                workExps.push(workExp)
            }
            delete result.work_experiences_ids
            delete result.collaborator_id
            delete result.content_cv
            result['work_experiences'] = workExps
            delete result.is_disable
            
            return { data: result, status: 0, message: "Success" }
        }
        return { data: null, status: 1, message: "Candidate not found" }
    }

    public async referCandidate(bearerToken: string, candidateId: string, postId: string, optionalFieldsValue: any[]): Promise<{ candidateIntroductionId: string, message: string, status: number }> {
        const userData = this._jwtToken.getUserInfo(bearerToken)
        const collaborator = await this._userRepo.getById(userData.id)
        if(collaborator.status === CollaboratorStatus.APPROVAL){
            const candidate = await this._candidateRepo.getById(candidateId);
            if(candidate === null){
                return { candidateIntroductionId: '', message: 'The candiate is not found', status: 1 }
            }
            if(candidate.collaborator_id !== userData.id){
                return { candidateIntroductionId: '', message: 'The candidate is not belong to this collaborator', status: 6 }
            }
            if(candidate.is_disable){
                return { candidateIntroductionId: '', message: 'The candiate is disable', status: 5 }
            }
            if(candidate.status !== CandidateStatus.LOOKINGJOB){
                return { candidateIntroductionId: '', message: 'The candiate already had a job', status: 2 }
            }
            const post = await this._postRepo.getById(postId)
            if(post === null){
                return { candidateIntroductionId: '', message: 'The post is not found', status: 1 }
            }    
            if(post.status !== 'active'){
                return { candidateIntroductionId: '', message: 'This post is not active', status: 5 }
            }
            const currentDate = new Date()
            let currentDateWithoutTime = currentDate
            currentDateWithoutTime.setHours(0, 0, 0, 0)
            if(currentDateWithoutTime.getTime() <= post.date_end && currentDateWithoutTime.getTime() <= post.date_off){
                const listCandiateIntroduction = await this._candidateIntroductionRepo.findByCondition({candidate_id: candidateId})
                for(let introduction of listCandiateIntroduction){
                    if(introduction.post_id === postId){
                        return { candidateIntroductionId: '', message: 'This candidate was referred for this post', status: 4 }
                    }
                    const newestStatus = await this._candidateStatusHistoryRepo.getNewestStatus(introduction._id.toString())
                    const regexStatus = /^(Employer Accept)|(Company Viewed)|(Company Accept)|(Send Test)|(Candidate Submit Test)|(Passed Test)|(Schedule Interview)|(Interviewed)|(Offer)|(Onboard)|(Pending)$/
                    if(regexStatus.test(newestStatus.status)){
                        return { candidateIntroductionId: '', message: 'This candidate is currently recruiting for another job ', status: 7 }
                    }
                }
                
                const candidateIntroduction: CandidateIntroduction = {
                    _id: undefined,
                    candidate_id: candidate._id.toString(),
                    post_id: post._id,
                    introduction_date: currentDateWithoutTime.getTime(),
                    onboard_date: null,
                    work_end_date: null
                }
                if(post.optional_field_ids.length !== 0 && optionalFieldsValue.length === 0){
                    //optionalFieldsValue = []
                    return { candidateIntroductionId: '', message: 'The optional field is require', status: 11 }
                }else if (post.optional_field_ids.length === 0 && optionalFieldsValue.length !== 0){
                    return { candidateIntroductionId: '', message: 'The post do not have optional field ', status: 12 }
                }
               
                for (let optionFieldValue of optionalFieldsValue) { // check xem co hop le khong
                    
                    const optionField = await this._optionalFieldRepo.getById(optionFieldValue.optionalFieldId)
                    if(optionField !== null){
                        const check  = post.optional_field_ids.find(o => ''+o === ''+optionField._id)
                        if(check === undefined){
                            return { candidateIntroductionId: '', message: 'The optional field with id '+optionFieldValue.optionalFieldId+' is not belong to the post', status: 6 }
                        }
                    }else{
                        return { candidateIntroductionId: '', message: 'The optional field with id '+optionFieldValue.optionalFieldId+' is not found', status: 1 }
                    }
                }
                    
                const resultCandidateIntroductionCreate = await this._candidateIntroductionRepo.create(candidateIntroduction)
                const candidateStatusHistory: CandidateIntroductionStatusHistory = {
                    _id: undefined,
                    candidate_introduction_id: resultCandidateIntroductionCreate._id.toString(),
                    status: IntroductionStatus.PENDING,
                    time: currentDate.getTime(),
                    note: null,
                    is_disable: false
                }
                await this._candidateStatusHistoryRepo.create(candidateStatusHistory)
                for (let optionFieldValue of optionalFieldsValue) { 
                    const opt: OptionalFieldsValue = {
                        _id: undefined,
                        optional_field_id: optionFieldValue.optionalFieldId,
                        candidate_introduction_id: '' + resultCandidateIntroductionCreate._id,
                        value: optionFieldValue.value
                    }
                    await this._optionalFieldValueRepo.create(opt)
                }
                return { candidateIntroductionId: resultCandidateIntroductionCreate._id.toString(), message: 'Success', status: 0 }
            }
            return { candidateIntroductionId: '', message: 'The recruitment date of post is overdue ', status: 10 }
        }
        return { candidateIntroductionId: '', message: 'The collaborator is not approval ', status: 5 }
    }


    public async updateCandidate(bearerToken: string, requestCandidate: RequestUpdateCandidate): Promise<{message: string, status: number}>{
        const userData = this._jwtToken.getUserInfo(bearerToken);
        const collaborator = await this._userRepo.getById(userData.id)
        if(collaborator.status === 'approval'){
            const candidate = await this._candidateRepo.getById(requestCandidate.id)
            if(candidate !== null){
                if(!candidate.is_disable){
                    if(candidate.collaborator_id === userData.id){
                        const listIntroduction = await this._candidateIntroductionRepo.findByCondition({candidate_id: candidate._id.toString()})
                        const regexStatus = /^(Pending)|(Employer Accept)|(Company Viewed)|(Company Accept)|(Send Test)|(Candidate Submit Test)|(Passed Test)|(Schedule Interview)|(Interviewed)|(Offer)|(Onboard)$/
                        for(let i of listIntroduction){
                            const newestStatus = await this._candidateStatusHistoryRepo.getNewestStatus(i._id.toString())
                            if(regexStatus.test(newestStatus.status)){
                                return { message: 'The candidate is already in recruitment process.', status: 5 }
                            }
                        }
                        const cityIds = requestCandidate.city_ids
                        for(let cityId of cityIds){
                            const city = await this._cityRepo.getById(cityId)
                            if(city === null){
                                return {message: 'The city with id '+cityId+' is not found', status: 1}
                            }
                        }
                        candidate.city_ids = requestCandidate.city_ids
                        const jobRoleIds = requestCandidate.job_role_ids
                        if(jobRoleIds !== null){
                            for(let jobRoleId of jobRoleIds){
                                const jobRole = await this._jobRoleRepo.getById(jobRoleId)
                                if(jobRole !== null){
                                    if(jobRole.status !== 'publish'){
                                        // error   
                                        return { message: 'The job role with id '+jobRoleId+' is not available ', status: 2}
                                    }
                                }else{
                                    return {message: 'The job role with id '+jobRoleId+' is not found ', status: 1}
                                }
                            } 
                        }
                        if(jobRoleIds === null){
                            requestCandidate.job_role_ids = []
                        }
                        requestCandidate["job_levels"] = null 
                        if(requestCandidate.job_level_array !== null){
                            const jobLevels = requestCandidate.job_level_array.toString()
                            requestCandidate["job_levels"] = jobLevels 
                        }
                        delete requestCandidate.job_level_array
            
                        const candidate_skills = requestCandidate.candidate_skills
                        if(candidate_skills !== null){
                            for(let candidateSkill of requestCandidate.candidate_skills){  
                                if(candidateSkill._id !== undefined){
                                    let candidateSkillId = ''+candidateSkill._id
                                    if(candidateSkillId.includes('delete')){
                                        candidateSkillId = candidateSkillId.split('(delete)')[0]
                                    }
                                    const checkCandidateSkillExsited = await this._candidateSkillRepo.getById(candidateSkillId)
                                    if(checkCandidateSkillExsited === null){
                                        return {message: 'The candidate skill with id '+candidateSkillId+' is not found ', status: 1}
                                    }else if (checkCandidateSkillExsited.candidate_id !== requestCandidate.id){
                                        return {message: 'The candidate skill with id '+candidateSkillId+' is not belong to this candidate ', status: 3}
                                    }
                                }
                                const skill = await this._skillRepo.getById(candidateSkill.skill_id)
                                if(skill === null){
                                    return {message: 'The skill with id '+candidateSkill.skill_id+' is not found ', status: 1}
                                }
                                
                            }
                        }
            
                        const workExperiences = requestCandidate.work_experiences 
                        if(workExperiences !== null){
                            for(let workExperience of workExperiences){
                                if(workExperience._id !== undefined){
                                    let workExperienceId = ''+workExperience._id
                                    if(workExperienceId.includes('delete')){
                                        workExperienceId = workExperienceId.split('(delete)')[0]
                                    }
                                    const checkCandidateWorkExperienceExsited = await this._candidateWorkExperienceRepo.getById(workExperienceId)
                                    if(checkCandidateWorkExperienceExsited === null){
                                        return {message: 'The candidate work experience with id '+workExperienceId+' is not found ', status: 1}
                                    }else if(checkCandidateWorkExperienceExsited.candidate_id !== requestCandidate.id){
                                        return {message: 'The candidate work experience with id '+workExperienceId+' is not belong to this candidate ', status: 3}
                                    }
                                }
                                for(let industryId of workExperience.industry_ids){
                                    const checkIndustryInWorkExperience = await this._industryRepo.getById(industryId)
                                    if(checkIndustryInWorkExperience !== null){
                                        if(checkIndustryInWorkExperience.status !== 'publish'){
                                            return { message: 'The industry with id '+industryId+' is not available ', status: 2}
                                        }
                                        // error
                                    }else{
                                        return {message: 'The industry with id '+industryId+' is not found ', status: 1}
                                    }
                                }
                                for(let jobRoleId of workExperience.job_role_ids){
                                    const jobRole = await this._jobRoleRepo.getById(jobRoleId)
                                    if(jobRole !== null){
                                        if(jobRole.status !== 'publish'){
                                            // error   
                                            return {message: 'The job role with id '+jobRoleId+' is not available ', status: 2}
                                        }
                                    }else{
                                        return {message: 'The job role with id '+jobRoleId+' is not found ', status: 1}
                                    }
                                }   
                            }
                        }
                        
                        const candidateLanguages = requestCandidate.candidate_languages
                        if(candidateLanguages !== null){   
                            for(let candidateLanguage of candidateLanguages){
                                if(candidateLanguage._id !== undefined){
                                    let candidateLanguageId = ''+candidateLanguage._id
                                    if(candidateLanguageId.includes('delete')){
                                        candidateLanguageId = candidateLanguageId.split('(delete)')[0]
                                    }
                                    const checkCandidateLanguageExsited = await this._candidateLanguageRepository.getById(candidateLanguageId)
                                    if(checkCandidateLanguageExsited === null){
                                        return {message: 'The candidate language with id '+candidateLanguageId+' is not found ', status: 1}
                                    }else if (checkCandidateLanguageExsited.candidate_id !== requestCandidate.id){
                                        return {message: 'The candidate language with id '+candidateLanguageId+' is not belong to this candidate ', status: 3}
                                    }
                                }
                                const checkLanguageExsited = await this._langRepo.getById(candidateLanguage.language_id)
                                if(checkLanguageExsited !== null){
                                    if(checkLanguageExsited.is_disable){
                                        // error   
                                        return { message: 'The language with id '+candidateLanguage.language_id+' is not available ', status: 2}
                                    }
                                }else{
                                    return {message: 'The language with id '+candidateLanguage.language_id+' is not found ', status: 1}
                                }
                            }
                        }
                        let listCandidateSkillId: string[] = []
                        let listWorkExperienceId: string[] = []
                        let listLanguageId: string[] = []
                        if(candidate_skills !== null){
                            for(let candidateSkill of candidate_skills){
                                if(candidateSkill._id === undefined){
                                    candidateSkill.candidate_id = requestCandidate.id
                                    const resultCreate = await this._candidateSkillRepo.create(candidateSkill)
                                    listCandidateSkillId.push(''+resultCreate._id)
                                }
                                else if(candidateSkill._id.toString().includes('delete')){
                                    candidateSkill._id = candidateSkill._id.split('(delete)')[0]
                                    await this._candidateSkillRepo.delete(candidateSkill._id)
                                }else {
                                    const candidateSkillId = candidateSkill._id
                                    delete candidateSkill._id
                                    const resultUpdate = await this._candidateSkillRepo.update(candidateSkillId, candidateSkill)
                                    listCandidateSkillId.push('' + resultUpdate._id)
                                }
                            }
                        }
                        delete requestCandidate.candidate_skills
                        if(workExperiences !== null){
                            for(let workExperience of workExperiences){
                                if(workExperience._id === undefined){
                                    workExperience.candidate_id = requestCandidate.id
                                    const resultUpdate =  await this._candidateWorkExperienceRepo.create(workExperience)
                                    listWorkExperienceId.push(''+resultUpdate._id)
                                } else if(workExperience._id.toString().includes('delete')){
                                    workExperience._id = workExperience._id.split('(delete)')[0]
                                    await this._candidateWorkExperienceRepo.delete(workExperience._id)
                                }else{
                                    const workExperienceId = workExperience._id
                                    delete workExperience._id
                                    const resultUpdate = await this._candidateWorkExperienceRepo.update(workExperienceId,workExperience)
                                    listWorkExperienceId.push(''+resultUpdate._id)
                                }
                            }
                        }
                        delete requestCandidate.work_experiences
                        if(candidateLanguages !== null){
                            for(let candidateLanguage of candidateLanguages){
                                if(candidateLanguage._id === undefined){
                                    candidateLanguage.candidate_id = requestCandidate.id
                                    const resultUpdate =  await this._candidateLanguageRepository.create(candidateLanguage)
                                    listLanguageId.push(''+resultUpdate._id) 
                                }else if(candidateLanguage._id.toString().includes('delete')){
                                    candidateLanguage._id = candidateLanguage._id.split('(delete)')[0]
                                    await this._candidateLanguageRepository.delete(candidateLanguage._id)
                                }
                                else{
                                    const languageId = candidateLanguage._id
                                    delete candidateLanguage._id
                                    const resultCreate = await this._candidateLanguageRepository.update(languageId, candidateLanguage)  
                                    listLanguageId.push(''+resultCreate._id) 
                                }
                            }
                        }
                        delete requestCandidate.candidate_languages
                        const candidateAvailability = requestCandidate.candidate_availability
                        switch (candidateAvailability) {
                            case "0":
                                requestCandidate.candidate_availability = 'có thể nhận ngay'
                                break;
                            case "1": 
                                requestCandidate.candidate_availability = 'sau 1 tháng'
                                break;
                            case "2":
                                requestCandidate.candidate_availability = 'sau 2 tháng'
                                break;
                            case "3":
                                requestCandidate.candidate_availability = 'sau 3 tháng'
                                break;
                            default:
                                break;
                        }
                        requestCandidate['candidate_skills_ids'] = listCandidateSkillId
                        requestCandidate['candidate_languages_ids'] = listLanguageId
                        requestCandidate['work_experiences_ids'] = listWorkExperienceId
                        if(requestCandidate.currency === null){
                            delete requestCandidate.currency
                        }
            
                        const candidateId = requestCandidate.id
                        delete requestCandidate.id
                        const resultUpdate = await this._candidateRepo.update(candidateId,requestCandidate)
                        if(resultUpdate !== null){
                            return {message: 'Success', status: 0}
                        }
                        return {message: 'Update fail (Server error)', status: 4}
                    }
                    return {message: 'The candidate is not belong to this collaborator', status: 3}
                }
                return {message: 'The candidate is disable', status: 2}
            }
            return {message: 'The candidate is not found', status: 1}
        }
        return {message: 'The collaborator is not apporval', status: 2}
        
    }
    public async referByCandidate(requestCandidate: RequestSelfAppliedCandidate): Promise<{message: string, status: number}>{
        const collaborator = await this._userRepo.getById(requestCandidate.collaborator_id)
        if(collaborator !== null){
            if(collaborator.status === CollaboratorStatus.APPROVAL){
                const post = await this._postRepo.getById(requestCandidate.post_id)
                if (post !== null) {
                    if(post.status === 'active'){
                        let currentDate = new Date()
                        let currentDateWithoutTime = currentDate
                        currentDateWithoutTime.setHours(0,0,0,0)
                        if(currentDateWithoutTime.getTime() <= post.date_end && currentDateWithoutTime.getTime() <= post.date_off){
                            let candidate = new Candidate()
                            // create candidate
                            const candidateAvailability = requestCandidate.candidate_availability
                            switch (candidateAvailability) {
                                case "0":
                                    candidate.candidate_availability = 'có thể nhận ngay'
                                    break;
                                case "1": 
                                    candidate.candidate_availability = 'sau 1 tháng'
                                    break;
                                case "2":
                                    candidate.candidate_availability = 'sau 2 tháng'
                                    break;
                                case "3":
                                    candidate.candidate_availability = 'sau 3 tháng'
                                    break;
                                default:
                                    break;
                            }
                            const jobRoleIds = requestCandidate.job_role_ids
                            if(jobRoleIds !== null){
                                for(let jobRoleId of jobRoleIds){
                                    const jobRole = await this._jobRoleRepo.getById(jobRoleId)
                                    if(jobRole !== null){
                                        if(jobRole.status !== 'publish'){
                                            // error   
                                            return {message: 'The job role with id '+jobRoleId+' is not available ', status: 1}
                                        }
                                    }else{
                                        return {message: 'The job role with id '+jobRoleId+' is not found ', status: 2}
                                    }
                                }
                                candidate.job_role_ids = requestCandidate.job_role_ids
                            } 
                            for(let cityId of requestCandidate.city_ids){
                                const city = await this._cityRepo.getById(cityId)
                                if(city !== null){
                                    if(city.status !== 'publish'){
                                        // error   
                                        return {message: 'The city with id '+cityId+' is not available ', status: 1}
                                    }
                                }else{
                                    return { message: 'The city with id '+cityId+' is not found ', status: 2}
                                }
                            }
                            candidate.city_ids = requestCandidate.city_ids  
                            const candidateSkills = requestCandidate.candidate_skills
                            if(candidateSkills !== null){
                                for(let candidateSkill of candidateSkills){                
                                    const skill = await this._skillRepo.getById(candidateSkill.skill_id)
                                    if(skill === null){
                                        return {message: 'The skill with id '+candidateSkill.skill_id+' is not found ', status: 2}
                                    }
                                    
                                }
                            }
                            
                            const workExperiences = requestCandidate.work_experiences 
                            if(workExperiences !== null){
                                for(let workExperience of workExperiences){
                                    for(let industryId of workExperience.industry_ids){
                                        const checkIndustryInWorkExperience = await this._industryRepo.getById(industryId)
                                        if(checkIndustryInWorkExperience !== null){
                                            if(checkIndustryInWorkExperience.status !== 'publish'){
                                                return { message: 'The industry with id '+industryId+' is not available ', status: 1}
                                            }
                                            // error
                                        }else{
                                            return { message: 'The industry with id '+industryId+' is not found ', status: 2}
                                        }
                                    }
                                    for(let jobRoleId of workExperience.job_role_ids){
                                        const jobRole = await this._jobRoleRepo.getById(jobRoleId)
                                        if(jobRole !== null){
                                            if(jobRole.status !== 'publish'){
                                                // error   
                                                return { message: 'The job role with id '+jobRoleId+' is not available ', status: 1}
                                            }
                                        }else{
                                            return { message: 'The job role with id '+jobRoleId+' is not found ', status: 2}
                                        }
                                    }   
                                }
                            }
                            
                            const candidateLanguages = requestCandidate.candidate_languages
                            if(candidateLanguages !== null){   
                                for(let language of candidateLanguages){
                                    const checkLanguageExsited = await this._langRepo.getById(language.language_id)
                                    if(checkLanguageExsited !== null){
                                        if(checkLanguageExsited.is_disable){
                                            // error   
                                            return { message: 'The language with id '+language.language_id+' is not available ', status: 1}
                                        }
                                    }else{
                                        return {message: 'The language with id '+language.language_id+' is not found ', status: 2}
                                    }
                                }
                            }          
                            
                            if( requestCandidate.salary_from !== null){
                                candidate.salary_from = requestCandidate.salary_from;
                            }
                            if( requestCandidate.salary_to !== null){
                                candidate.salary_to = requestCandidate.salary_to;
                            }
                            if(requestCandidate.current_salary !== null){
                                candidate.current_salary = requestCandidate.current_salary
                            }
                            
                            const filename = path.basename(requestCandidate.path_cv_hided) // get filename
                               
                            
                            const path_cv_original = Constants.pathTmpOriginalCv +filename
                            if(!fs.existsSync(path_cv_original)){
                                return {message: 'The path cv hided is not existed', status: 2}
                            }
                            let dataBuffer = fs.readFileSync(path_cv_original)
                            // doc pdf
                            
                            let contentCv = '';
                            const extname = path.extname(requestCandidate.path_cv_hided) 
                            if(extname === '.pdf'){ // doc pdf
                                const dataCv = await pdfparse(dataBuffer)
                                contentCv = dataCv.text;
                            }else if(extname === '.html'){
                                contentCv = this._htmlHandler.extractText(path_cv_original)
                            }
                            else if(extname === '.docx'){
                               const resultReadDocx = await this._docxHandler.extractText(path_cv_original)
                               if(resultReadDocx.status === 0){
                                   contentCv = resultReadDocx.content
                               }else{
                                    return {message: ''+resultReadDocx.message, status: resultReadDocx.status} 
                               }
                            }
                            if(requestCandidate.optionalFieldsValue === null ){
                                requestCandidate.optionalFieldsValue = []
                            }
                            for (let optionFieldValue of requestCandidate.optionalFieldsValue) { // check
                                const optionField = await this._optionalFieldRepo.getById(optionFieldValue.optionalFieldId)
                                if(optionField !== null){
                                    const check  = post.optional_field_ids.find(o => ''+o === ''+optionField._id)
                                    if(check === undefined){
                                        return { message: 'The optional field with id '+optionFieldValue.optionalFieldId+' is not belong to the post', status: 3 }
                                    }
                                }else{
                                    return {  message: 'The optional field with id '+optionFieldValue.optionalFieldId+' is not found', status: 2 }
                                }
                            }
                            //application/vnd.openxmlformats-officedocument.wordprocessingml.document
                            
                            //candidate.content_cv = contentCv.toLowerCase().trim().replace(/\r?\n|\r/g,' ')
                            if(requestCandidate.job_levels !== null){
                                candidate.job_levels = requestCandidate.job_levels.toString()
                            } 
                            candidate.currency = requestCandidate.currency
                            candidate.negotiable = requestCandidate.negotiable;
                            candidate.name = requestCandidate.name
                            candidate.phone = requestCandidate.phone
                            candidate.email = requestCandidate.email
                            candidate.city_ids= requestCandidate.city_ids
                            candidate.profile_title = requestCandidate.profile_title
                            candidate.collaborator_id = requestCandidate.collaborator_id
                            candidate.candidate_availability = requestCandidate.candidate_availability
                            candidate.suitable_reason = requestCandidate.suitable_reason
                            candidate.candidate_expectation = requestCandidate.candidate_expectation
                            // kho biet nen set luong thuong lung ở trong schema không
                            candidate.content_cv = contentCv.trim()
                            candidate.is_disable = false
                            candidate.content_cv_clean = this._pdfHandler.removeAccents(contentCv).toLowerCase().trim().replace(/\r?\n|\r/g,' ')
                            candidate.date_created = new Date().getTime()
                            candidate.status = CandidateStatus.LOOKINGJOB
                            const pathHide = Constants.pathTmpFixedCv + filename 
                            const pathOriginal = Constants.pathTmpOriginalCv + filename      
                            fs.rename(pathHide, Constants.pathFixedCv + filename, (err) => {
                                if (err) {
                                    console.log(err);
                                }
                            })
                            fs.rename(pathOriginal, Constants.pathOriginalCv + filename, (err) => {
                                if (err) {
                                    console.log(err);
                                }
                            })
                    
                            let file = new File()
                            file.path = Constants.pathFixedCv + filename
                            file.extension = extname.replace('.','')
                            file.name = filename
                            file.type = file.extension
                            file.user_id = requestCandidate.collaborator_id
                            const resultCreateFile = await this._fileRepo.create(file)
                            candidate.cv_id = resultCreateFile._id.toString()
                            const resultCreateCandidate = await this._candidateRepo.create(candidate)
                            let listCandidateSkillId: string[] = []
                            let listWorkExperienceId: string[] = []
                            let listLanguageId: string[] = []
                            if(candidateSkills !== null){
                                for(let candidateSkill of requestCandidate.candidate_skills){
                                    candidateSkill.candidate_id = resultCreateCandidate._id
                                    const resultCandidateSkill = await this._candidateSkillRepo.create(candidateSkill)
                                    listCandidateSkillId.push(resultCandidateSkill._id.toString())
                                }
                            }
                            
                            if(workExperiences !== null){
                                for(let workExperience of requestCandidate.work_experiences){
                                    workExperience.candidate_id = resultCreateCandidate._id
                                    const resultWorkExperience =  await this._candidateWorkExperienceRepo.create(workExperience)
                                    listWorkExperienceId.push(resultWorkExperience._id.toString())
                                }
                            }
                            if(candidateLanguages !== null){
                                for(let language of requestCandidate.candidate_languages){
                                    language.candidate_id = resultCreateCandidate._id
                                    const resultLanaguage = await this._candidateLanguageRepository.create(language)
                                    listLanguageId.push(resultLanaguage._id.toString())
                                }
                            }
                            await this._candidateRepo.update(resultCreateCandidate._id,
                                {candidate_skills_ids: listCandidateSkillId,
                                 candidate_languages_ids: listLanguageId,
                                 work_experiences_ids: listWorkExperienceId
                                })
                            // refer
                            
                            const candidateIntroduction: CandidateIntroduction = {
                                _id: undefined,
                                candidate_id: resultCreateCandidate._id.toString(),
                                post_id: post._id,
                                introduction_date: currentDateWithoutTime.getTime(),
                                onboard_date: null,
                                work_end_date: null
                            }
                           
                            
                            const resultCandidateIntroductionCreate = await this._candidateIntroductionRepo.create(candidateIntroduction)
                            const candidateStatusHistory: CandidateIntroductionStatusHistory = {
                                _id: undefined,
                                candidate_introduction_id: resultCandidateIntroductionCreate._id.toString(),
                                status: IntroductionStatus.PENDING,
                                time: currentDate.getTime(),
                                note: null,
                                is_disable: false
                            }
                            await this._candidateStatusHistoryRepo.create(candidateStatusHistory)
                            for (let optionFieldValue of requestCandidate.optionalFieldsValue) { // 
                                const opt: OptionalFieldsValue = {
                                    _id: undefined,
                                    optional_field_id: optionFieldValue.optionalFieldId,
                                    candidate_introduction_id: '' + resultCandidateIntroductionCreate._id,
                                    value: optionFieldValue.value
                                }
                                 await this._optionalFieldValueRepo.create(opt)
                            }
                            return { message: 'Success', status: 0 }

                        }
                        return {message: 'The recruitment date of post is overdue ', status: 4 }
                    }
                    return { message: 'The post is not active', status: 1 }
                }
                return { message: 'The post is not found', status: 2 }
            }
            return { message: 'The collaborator is not apporval', status: 1 }
        }
        return { message: 'The collaborator is not found', status: 2 }
    }

    public async downloadCvFile(bearerToken: string, candidateId: string): Promise<{path: string,message: string, status: number}>{
        const userData = await this._jwtToken.getUserInfo(bearerToken)
        let collaborator = null
        const candidate = await this._candidateRepo.getById(candidateId)
        if(candidate === null){
            return {path: '', message: 'The candidate is not found', status: 1}
        }
        if(userData.type_account === 'collaborator'){
            collaborator = await this._userRepo.getById(userData.id)
            if(collaborator === null){
                return {path: '', message: 'The collaborator is not found', status: 1}
            }
            if(candidate.collaborator_id !== userData.id){
                return {path: '', message: 'The candidate is not belogn to the collaborator', status: 2}
            }
        }
        const cvFile = await this._fileRepo.getById(candidate.cv_id)
        if(cvFile === null){
            return {path: '', message: 'The file is not found', status: 1}
        }
        return {
            path: cvFile.path,
            message: 'Success',
            status:0
        }
    }
} 
