import { inject, injectable } from "inversify";
import { Constants, IntroductionStatus, JobGuarantee, NotifyIconUrl, NotifyType, PaymentStatus, TAtatoolUrl } from "../../common/constants";
import { CandidateIntroductionStatusHistory } from "../../entities/candidate_introduction_status_history";
import { Token } from "../../JwtToken/JwtToken";
import { ICandidateRepository } from "../../repositories/candidate.repository";
import { ICandidateIntroductionRepository } from "../../repositories/candidate_introduction.repository";
import { ICandidateIntroductionStatusHistoryRepository } from "../../repositories/candidate_introduction_status_history.repository";
import { ICandidateLanguageRepository } from "../../repositories/candidate_language.repository";
import { ICandidateSkillRepository } from "../../repositories/candidate_skill.repository";
import { ICityRepository } from "../../repositories/city.repository";
import { ICompanyRepository } from "../../repositories/company.repository";
import { IFileRepository } from "../../repositories/file.repository";
import { IIndustryRepository } from "../../repositories/industry.repository";
import { IInterviewRepository } from "../../repositories/interview.repository";
import { IInterviewScheduleRepository } from "../../repositories/interview_schedule.repository";
import { IInterviewScheduleStatusHistoryRepository } from "../../repositories/interview_schedule_status_history.repository";
import { IJobRoleRepository } from "../../repositories/job_role.repository";
import { ILanguageRepository } from "../../repositories/language.repository";
import { IOptionalFieldRepository } from "../../repositories/optional_field.repository";
import { IOptionalFieldValueRepository } from "../../repositories/optional_field_value.repository";
import { IPostRepository } from "../../repositories/post.repository";
import { ISkillRepository } from "../../repositories/skill.repository";
import { IUserRepository } from "../../repositories/user.repository";
import { ICandidateWorkExperienceRepository } from "../../repositories/work_experience.repository";
import { TYPES } from "../../types";
import path from 'path'
import { exportExcel } from '../../excel.service'
import { IPlacementRepository } from "../../repositories/placement.repository";
import { Placement } from "../../entities/placement";
import { IBankAccountRepository } from "../../repositories/bank_account.repository";
import { IWarrantyRepository } from "../../repositories/warranty.repository";
import { INotificationRepository } from "../../repositories/notification.repository";
import { Notification } from "../../entities/notification";
import { sendNotification } from "../../firebase";
import { Warranty } from "../../entities/warranty";
import { InviteTestService } from "../../invite_test.service";
import { ICandidateIntroductionTestRepository } from "../../repositories/candidate_introduction_test_repository";
import { CandidateIntroductionTest } from "../../entities/candidate_introduction_test";
import { ObjectId } from "mongodb";
import {CandidateStatus} from '../../common/constants'

export interface ICandidateIntroductionService {
    getCandidatesOfPost(bearerToken: string, condition, pageIndex: number, pageSize: number, sortBy: number): Promise<{
        pageIndex: number,
        pageSize: number,
        totalPages: number,
        totalCount: number,
        candidateIntroductions: any[],
        message: string,
        status: number
    }>
    getCandidateDetail(bearerToken: string, id: string): Promise<{ data: {}, status: number, message: string }>
    searchCandidateIntroductionForEmployer(bearerToken: string, condition, pageIndex: number, pageSize: number, sortBy: number): Promise<{
        pageIndex: number,
        pageSize: number,
        totalPages: number,
        totalCount: number,
        candidateIntroductions: any[],
        message: string,
        status: number
    }>
    searchCandidateIntroductionOfCollaborator(bearerToken: string, condition, pageIndex: number, pageSize: number, sortBy: number): Promise<{
        pageIndex: number,
        pageSize: number,
        totalPages: number,
        totalCount: number,
        candidateIntroductions: any[],
        message: string,
        status: number
    }>
    searchCandidateIntroductionForCollaborator(bearerToken: string, condition, pageIndex: number, pageSize: number, sortBy: number): Promise<{
        pageIndex: number,
        pageSize: number,
        totalPages: number,
        totalCount: number,
        candidateIntroductions: any[]
    }>
    exportToExcel(dataToExport: any[]): Promise<string>
    cancelRefer(bearerToken: string, candidateIntroductionId: string, postId: string, reason: string): Promise<{ message: string, status: number }>
    getReportForStatistic(token: string, reportBy: string, date: string, number: number, statuses: Array<string>): Promise<{ data: {}, message: string, status: number }>
    getReportForPosts(token: string, postIds: string[]): Promise<{ data: {}, message: string, status: number }>
    inviteTest(token: string, candidate_introduction_id: string, email: string, question_packages: any[], invited_at: number, expired: number): Promise<{ message: string, status: number }>
    getReportTest(token: string, candidate_introduction_id: string, question_packages: any[]): Promise<{ data: any, message: string, status: number }>
    updateStatusHistory(bearerToken: string, candidateIntroductionId: string, onboardDate: string, workEndDate: string, note: string, status: string): Promise<{ statusHistoryId: string, message: string, status: number }>
    chooseCandidateToWarranty(candidateIntroductionGuaranteedId: string, candidateIntroductionAlternativeId: string): Promise<{ message: string, status: number }>
    searchCandidateIntroductionToWarranty(bearerToken: string, condition, pageIndex: number, pageSize: number, sortBy: number): Promise<{
        pageIndex: number,
        pageSize: number,
        totalPages: number,
        totalCount: number,
        candidateIntroductions: any[],
        message: string,
        status: number
    }>
}


@injectable()
export class CandidateIntroductionService implements ICandidateIntroductionService {
    @inject(TYPES.ICandidateIntroductionRepository) private _candidateIntroductionRepo: ICandidateIntroductionRepository
    @inject(TYPES.IJobRoleRepository) private readonly _jobRoleRepo: IJobRoleRepository
    @inject(TYPES.ICityRepository) private readonly _cityRepo: ICityRepository
    @inject(TYPES.ISkillRepository) private readonly _skillRepo: ISkillRepository
    @inject(TYPES.IFileRepository) private readonly _fileRepo: IFileRepository
    @inject(TYPES.ILanguageRepository) private readonly _langRepo: ILanguageRepository
    @inject(TYPES.IPostRepository) private readonly _postRepo: IPostRepository
    @inject(TYPES.ICandidateRepository) private readonly _candidateRepo: ICandidateRepository
    @inject(TYPES.ICandidateSkillRepository) private readonly _candidateSkillRepo: ICandidateSkillRepository
    @inject(TYPES.ICandidateLanguageRepository) private readonly _candidateLangRepo: ICandidateLanguageRepository
    @inject(TYPES.ICandidateWorkExperienceRepository) private readonly _workExpRepo: ICandidateWorkExperienceRepository
    @inject(TYPES.IInterviewRepository) private readonly _interviewRepo: IInterviewRepository
    @inject(TYPES.IInterviewScheduleRepository) private readonly _scheduleRepo: IInterviewScheduleRepository
    @inject(TYPES.IUserRepository) private readonly _userRepo: IUserRepository
    @inject(TYPES.IIndustryRepository) private readonly _industryRepo: IIndustryRepository
    @inject(TYPES.IOptionalFieldValueRepository) private readonly _optFieldValRepo: IOptionalFieldValueRepository
    @inject(TYPES.IOptionalFieldRepository) private readonly _optFieldRepo: IOptionalFieldRepository
    @inject(TYPES.ICandidateIntroductionStatusHistoryRepository) private readonly _statusHistoryRepo: ICandidateIntroductionStatusHistoryRepository
    @inject(TYPES.IInterviewScheduleStatusHistoryRepository) private readonly _schedulestatusHistoryRepo: IInterviewScheduleStatusHistoryRepository
    @inject(TYPES.ICompanyRepository) private readonly _companyRepo: ICompanyRepository
    @inject(TYPES.IPlacementRepository) private readonly _placementRepo: IPlacementRepository
    @inject(TYPES.IBankAccountRepository) private readonly _bankAccountRepo: IBankAccountRepository
    @inject(TYPES.IWarrantyRepository) private readonly _warrantyRepo: IWarrantyRepository
    @inject(TYPES.INotificationRepository) private readonly _notifyRepo: INotificationRepository
    @inject(TYPES.ICandidateIntroductionTestRepository) private readonly _introductionTestRepo: ICandidateIntroductionTestRepository
    @inject(TYPES.Token) private readonly _jwtToken: Token
    @inject(TYPES.InviteTestService) private readonly _inviteTestService: InviteTestService

    public async getCandidatesOfPost(bearerToken: string, condition, pageIndex: number, pageSize: number, sortBy: number): Promise<{
        pageIndex: number,
        pageSize: number,
        totalPages: number,
        totalCount: number,
        candidateIntroductions: any[],
        message: string,
        status: number
    }> {
        const userData = this._jwtToken.getUserInfo(bearerToken)
        if (userData.type_account === 'employer' && !userData.permission.includes('post.all') && !userData.permission.includes('post.candidate')) {
            return {
                pageIndex: 0,
                pageSize: 0,
                totalPages: 0,
                totalCount: 0,
                candidateIntroductions: [],
                message: 'Permission is required',
                status: 0
            }
        }
        const post = await this._postRepo.getById(condition.post_id)
        if (post !== null) {
            const sort = {}
            if (sortBy === 0) {
                sort['_id'] = -1 // -1 la giam dan
            }
            let status = condition.status
            switch (status) {
                case '0':
                    status = null
                    break;
                case '1': // Pending
                    status = IntroductionStatus.PENDING
                    break;
                case '2':
                    status = IntroductionStatus.DECLINE
                    break;
                case '3':
                    status = IntroductionStatus.EMPLOYER_ACCEPT
                    break;
                case '4':
                    status = IntroductionStatus.VIEWED
                    break;
                case '5':
                    status = IntroductionStatus.REJECT
                    break;
                case '6':
                    status = IntroductionStatus.COMPANY_ACCEPT
                    break;
                case '7':
                    status = IntroductionStatus.SEND_TEST
                    break;
                case '8':
                    status = IntroductionStatus.SUBMIT_TEST
                    break;
                case '9':
                    status = IntroductionStatus.FAILED_TEST
                    break;
                case '10':
                    status = IntroductionStatus.PASSED_TEST
                    break;
                case '11':
                    status = IntroductionStatus.SCHEDULE
                    break;
                case '12':
                    status = IntroductionStatus.REJECT_INTERVIEW
                    break;
                case '13':
                    status = IntroductionStatus.INTERVIEWED
                    break;
                case '14':
                    status = IntroductionStatus.FAILED_INTERVIEW
                    break;
                case '15':
                    status = IntroductionStatus.OFFER
                    break;
                case '16':
                    status = IntroductionStatus.ONBOARD
                    break;
                case '17':
                    status = IntroductionStatus.RESIGN
                    break;
                case '18':
                    status = IntroductionStatus.COMPLETED
                    break;
                default:
                    break;
            }
            delete condition.status

            let candidateIntroductions = await this._candidateIntroductionRepo.findCandidateIntroductionByCondition(condition, sort)
            let listCandidateIntroductionReturn = []
            for (let candidateIntroduction of candidateIntroductions) {
                const candidate = await this._candidateRepo.getById(candidateIntroduction.candidate_id)
                let newestStatus = await this._statusHistoryRepo.getNewestStatus(candidateIntroduction._id.toString())
                const candidateIntroductionReturn = {
                    id: candidateIntroduction._id,
                    candidate_name: candidate.name,
                    post_title: post.title,
                    status: newestStatus.status,
                    introduction_date: candidateIntroduction.introduction_date
                }
                let flag = true
                if (status !== null && status !== newestStatus.status) {
                    flag = false
                }
                if (userData.type_account === 'collaborator' && candidate.collaborator_id !== userData.id) {
                    flag = false
                }
                if (flag) {
                    listCandidateIntroductionReturn.push(candidateIntroductionReturn)
                }
            }
            if (sortBy === 1) { // candidate name
                listCandidateIntroductionReturn = listCandidateIntroductionReturn.sort((a, b) => a.candidate_name.toLowerCase().localeCompare(b.candidate_name.toLowerCase()))
            } else if (sortBy === 2) { // post title
                listCandidateIntroductionReturn = listCandidateIntroductionReturn.sort((a, b) => a.post_title.toLowerCase().localeCompare(b.post_title.toLowerCase()))
            }
            const totalCount = candidateIntroductions.length
            listCandidateIntroductionReturn = listCandidateIntroductionReturn.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)
            const dtoReturn = {
                pageIndex,
                pageSize,
                totalPages: Math.ceil(totalCount / pageSize),
                totalCount,
                candidateIntroductions: listCandidateIntroductionReturn,
                message: 'Success',
                status: 0
            }
            return dtoReturn
        }
        return {
            pageIndex: 0,
            pageSize: 0,
            totalPages: 0,
            totalCount: 0,
            candidateIntroductions: [],
            message: 'The post is not exsited',
            status: 1
        }
    }

    public async getCandidateDetail(bearerToken: string, introductionId: string): Promise<{ data: {}, status: number, message: string }> {
        const introduction = await this._candidateIntroductionRepo.getById(introductionId)
        const userInfo = this._jwtToken.getUserInfo(bearerToken)
        if (userInfo.type_account === 'employer' && !userInfo.permission.includes('candidate.all') && !userInfo.permission.includes('candidate.detail')) {
            return { data: null, status: 1, message: "Permission is required" }
        }
        if (introduction !== null) {
            const result = await this._candidateRepo.getById(introduction.candidate_id)
            if (result !== null && result.is_disable === false) {
                if (userInfo.type_account === 'collaborator' && result.collaborator_id !== userInfo.id) {
                    return { data: null, status: 1, message: "Candidate not found" }
                }
                const cvRecord = await this._fileRepo.getById(result.cv_id)
                delete result.cv_id
                result['cv'] = '/static/cv/' + cvRecord.name
                const listJobRole = []
                const cities = []
                const skills = []
                const languages = []
                const workExps = []
                delete result.content_cv
                delete result.content_cv_clean
                let job_role_ids = []
                if (result.job_role_ids !== null) {
                    job_role_ids = result.job_role_ids
                }
                for (let jobRoleId of job_role_ids) {
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
                    const candidateLanguage = await this._candidateLangRepo.getById(languageId)
                    const language = await this._langRepo.getById(candidateLanguage.language_id)
                    delete candidateLanguage.candidate_id
                    delete candidateLanguage.language_id
                    candidateLanguage['language'] = language
                    languages.push(candidateLanguage)
                }
                delete result.candidate_languages_ids
                result['candidate_languages'] = languages

                for (let workExpId of result.work_experiences_ids) {
                    const workExp = await this._workExpRepo.getById(workExpId)
                    let industries = []
                    for (let industryId of workExp.industry_ids) {
                        const industry = await this._industryRepo.getById(industryId)
                        industries.push(industry)
                    }
                    delete workExp.industry_ids
                    workExp['industries'] = industries
                    let jobRoles = []
                    for (let jobRoleId of workExp.job_role_ids) {
                        const jobRole = await this._jobRoleRepo.getById(jobRoleId)
                        jobRoles.push(jobRole)
                    }
                    delete workExp.job_role_ids
                    delete workExp.candidate_id
                    workExp['job_roles'] = jobRoles
                    workExps.push(workExp)
                }
                delete result.work_experiences_ids
                result['work_experiences'] = workExps
                delete result.is_disable

                let optFieldVals = []
                const listOptFieldVals = await this._optFieldValRepo.findByCondition({ candidate_introduction_id: introduction._id })
                for (let optFieldVal of listOptFieldVals) {
                    const optField = await this._optFieldRepo.getById(optFieldVal.optional_field_id)
                    delete optFieldVal.candidate_introduction_id
                    delete optFieldVal.optional_field_id
                    optFieldVal['optional_field'] = optField
                    optFieldVals.push(optFieldVal)
                }
                result['optional_field_values'] = optFieldVals

                let interviews = []
                const post = await this._postRepo.getById(introduction.post_id)
                const company = await this._companyRepo.getById(post.company_id)
                for (let interviewId of post.interview_ids) {
                    const interview = await this._interviewRepo.getById(interviewId)
                    const schedule = await this._scheduleRepo.getScheduleByCondition({ candidate_introduction_id: introduction._id, interview_id: interview._id })
                    if (schedule !== null) {
                        const statusHistories = await this._schedulestatusHistoryRepo.findStatusHistoryByCondition({ interview_schedule_id: schedule._id.toString() }, { time: -1 })
                        delete statusHistories[0].interview_schedule_id
                        const scheduleReturn = {
                            id: schedule._id,
                            interview_start_date: schedule.interview_start_date,
                            interview_end_date: schedule.interview_end_date,
                            note: schedule.note,
                            status_history: statusHistories[0],
                            supervisor: null
                        }
                        if (schedule.supervisor_id !== null) {
                            const supervisor = await this._userRepo.getById(schedule.supervisor_id)
                            let supervisorReturn = {
                                id: supervisor._id,
                                name: supervisor.first_name + ' ' + supervisor.last_name,
                                email: supervisor.email,
                            }
                            scheduleReturn.supervisor = supervisorReturn
                        }
                        interview['schedule'] = scheduleReturn
                    } else {
                        interview['schedule'] = null
                    }
                    interviews.push(interview)
                }
                delete post.interview_ids
                delete post.optional_field_ids
                result['interviews'] = interviews
                result['post'] = post
                result['company'] = company
                result['introduction_id'] = introduction._id
                result['introduction_date'] = introduction.introduction_date
                result['onboard_date'] = introduction.onboard_date
                result['work_end_date'] = introduction.work_end_date
                const statusHistories = await this._statusHistoryRepo.getStatusHistories({ candidate_introduction_id: introduction._id }, { time: -1 })
                result['status_histories'] = statusHistories
                //let condition = { $or: [{ guaranteed_candidate_introuduction_id: introduction._id }, { alternative_candidate_introuduction_id: introduction._id }] }
                let condition = { guaranteed_candidate_introuduction_id: introduction._id.toString() }
                const warrantyRecord = await this._warrantyRepo.findByCondition(condition)
                // kiem tra xem thag này là thag bảo hành hay dc bảo hành
                result['candidateGuaranteed'] = null
                result['alternativeCandidates'] = null
                const checkWarrantyAlternative = await this._warrantyRepo.findByCondition({ alternative_candidate_introuduction_id: introduction._id.toString() })
                if (checkWarrantyAlternative.length !== 0) { // thga này là thag đi bảo hành thag khác
                    const candidateIntroductionGuaranteed = await this._candidateIntroductionRepo.getById(checkWarrantyAlternative[0].guaranteed_candidate_introuduction_id)
                    const candidateIntroductionAlternative = await this._candidateIntroductionRepo.getById(checkWarrantyAlternative[0].alternative_candidate_introuduction_id)
                    let remainingWarrantyDays = 0
                    let warrantyDate = checkWarrantyAlternative[0].number_of_warranty_days
                    if (checkWarrantyAlternative[0].status === 'Not complete') {
                        let difference_In_Time = new Date().getTime() - candidateIntroductionAlternative.onboard_date // đã làm được nhiêu ngày 
                        let difference_In_Days = difference_In_Time / (1000 * 3600 * 24)


                        if (difference_In_Days < 0) {
                            difference_In_Days = 0
                        }
                        warrantyDate = difference_In_Days
                        remainingWarrantyDays = checkWarrantyAlternative[0].number_of_warranty_days - difference_In_Days
                    } else if (checkWarrantyAlternative[0].status === 'Failed') {
                        if (candidateIntroductionAlternative.work_end_date !== null) {
                            let difference_In_Time = candidateIntroductionAlternative.work_end_date - candidateIntroductionAlternative.onboard_date; // thag B là được nhiêu ngày rồi
                            // To calculate the no. of days between two dates
                            let difference_In_Days = difference_In_Time / (1000 * 3600 * 24)
                            if (difference_In_Days < 0) {
                                difference_In_Days = 0
                            }
                            warrantyDate = difference_In_Days
                            remainingWarrantyDays = checkWarrantyAlternative[0].number_of_warranty_days - difference_In_Days
                        }

                    }
                    warrantyDate = Math.floor(warrantyDate)
                    remainingWarrantyDays = Math.floor(remainingWarrantyDays)
                    const candidateGuaranteed = await this._candidateRepo.getById(candidateIntroductionGuaranteed.candidate_id)
                    let candidateReturn = {
                        id: candidateGuaranteed._id,
                        name: candidateGuaranteed.name,
                        email: candidateGuaranteed.email,
                        phone: candidateGuaranteed.phone,
                        status: checkWarrantyAlternative[0].status,
                        numberDaysWarranty: checkWarrantyAlternative[0].number_of_warranty_days,
                        warrantyDate,
                        remainingWarrantyDays,
                        warrantyStartDate: checkWarrantyAlternative[0].warranty_start_date
                    }
                    result['candidateGuaranteed'] = candidateReturn

                } else if (warrantyRecord.length > 0) {
                    const listAlternativeCandidate = []
                    for (let warranty of warrantyRecord) { // lấy thông tin các thag bảo hành 
                        const candidateIntroductionAlternative = await this._candidateIntroductionRepo.getById(warranty.alternative_candidate_introuduction_id)
                        const alterCandidate = await this._candidateRepo.getById(candidateIntroductionAlternative.candidate_id)
                        let remainingWarrantyDays = 0
                        let warrantyDate = warranty.number_of_warranty_days
                        if (warranty.status === 'Not complete') {
                            let difference_In_Time = Math.floor(new Date().getTime() - candidateIntroductionAlternative.onboard_date) // đã làm được nhiêu ngày 
                            let difference_In_Days = difference_In_Time / (1000 * 3600 * 24)
                            if (difference_In_Days < 0) {
                                difference_In_Days = 0
                            }
                            warrantyDate = difference_In_Days
                            remainingWarrantyDays = warranty.number_of_warranty_days - difference_In_Days

                        } else if (warranty.status === 'Failed') {
                            if (candidateIntroductionAlternative.work_end_date !== null) {
                                let difference_In_Time = candidateIntroductionAlternative.work_end_date - candidateIntroductionAlternative.onboard_date; // thag B là được nhiêu ngày rồi
                                // To calculate the no. of days between two dates
                                let difference_In_Days = difference_In_Time / (1000 * 3600 * 24)
                                warrantyDate = difference_In_Days
                                remainingWarrantyDays = warranty.number_of_warranty_days - difference_In_Days
                            }

                        }
                        let candidateReturn = {
                            id: alterCandidate._id,
                            name: alterCandidate.name,
                            email: alterCandidate.email,
                            phone: alterCandidate.phone,
                            status: warranty.status,
                            warrantyDate,
                            remainingWarrantyDays,
                            numberDaysWarranty: warranty.number_of_warranty_days,
                            warrantyStartDate: warranty.warranty_start_date,
                        }
                        listAlternativeCandidate.push(candidateReturn)
                    }
                    result['alternativeCandidates'] = listAlternativeCandidate
                }
                const placement = await this._placementRepo.findByCondition({ candidate_introduction_id: introduction._id })
                if (placement.length > 0) {
                    result['placement'] = { id: placement[0]._id, create_date: placement[0].created_date }
                }
                return { data: result, status: 0, message: "Success" }
            }
            return { data: null, status: 1, message: "Candidate not found" }
        }
        return { data: null, status: 1, message: "Candidate not found" }
    }

    public async searchCandidateIntroductionForEmployer(bearerToken: string, condition, pageIndex: number, pageSize: number, sortBy: number): Promise<{
        pageIndex: number,
        pageSize: number,
        totalPages: number,
        totalCount: number,
        candidateIntroductions: any[],
        message: string,
        status: number
    }> {
        const employer = this._jwtToken.getUserInfo(bearerToken)
        if (employer.permission.includes('candidate.all') || employer.permission.includes('candidate.search')) {
            let sort = {};
            if (sortBy === 0) {
                sort['_id'] = -1

            }
            if (condition.introduction_date_to !== undefined && condition.introduction_date_from !== undefined) { // search gt lt
                condition.introduction_date = { $gte: condition.introduction_date_from, $lte: condition.introduction_date_to }
            } else if (condition.introduction_date_to === undefined && condition.introduction_date_from !== undefined) {// search gt
                condition.introduction_date = { $gte: condition.introduction_date_from }
            } else if (condition.introduction_date_to !== undefined && condition.introduction_date_from === undefined) { // search lt
                condition.introduction_date = { $lte: condition.introduction_date_to }
            }

            delete condition.introduction_date_to
            delete condition.introduction_date_from
            const offset = pageSize * pageIndex
            let status = condition.status
            switch (status) {
                case '0':
                    status = null
                    break;
                case '1': // Pending
                    status = IntroductionStatus.PENDING
                    break;
                case '2':
                    status = IntroductionStatus.DECLINE
                    break;
                case '3':
                    status = IntroductionStatus.EMPLOYER_ACCEPT
                    break;
                case '4':
                    status = IntroductionStatus.VIEWED
                    break;
                case '5':
                    status = IntroductionStatus.REJECT
                    break;
                case '6':
                    status = IntroductionStatus.COMPANY_ACCEPT
                    break;
                case '7':
                    status = IntroductionStatus.SEND_TEST
                    break;
                case '8':
                    status = IntroductionStatus.SUBMIT_TEST
                    break;
                case '9':
                    status = IntroductionStatus.FAILED_TEST
                    break;
                case '10':
                    status = IntroductionStatus.PASSED_TEST
                    break;
                case '11':
                    status = IntroductionStatus.SCHEDULE
                    break;
                case '12':
                    status = IntroductionStatus.REJECT_INTERVIEW
                    break;
                case '13':
                    status = IntroductionStatus.INTERVIEWED
                    break;
                case '14':
                    status = IntroductionStatus.FAILED_INTERVIEW
                    break;
                case '15':
                    status = IntroductionStatus.OFFER
                    break;
                case '16':
                    status = IntroductionStatus.ONBOARD
                    break;
                case '17':
                    status = IntroductionStatus.RESIGN
                    break;
                case '18':
                    status = IntroductionStatus.COMPLETED
                    break;
                default:
                    break;
            }
            delete condition.status
            let conditionSearchPost = {
                title: { $regex: condition.keyword, $options: 'i' }
            }
            let listCompany: string[] = []
            if (condition.company_ids === '0') {
                delete condition.company_ids
            } else {
                listCompany = condition.company_ids.split(',')
                conditionSearchPost['company_id'] = { $in: listCompany }
                delete condition.company_ids
            }

            const listCandidate = await this._candidateRepo.findByCondition({ name: { $regex: condition.keyword, $options: 'i' } })
            let listCandidateIdApplied = []
            for (let c of listCandidate) {
                const listCandidateIntroducion = await this._candidateIntroductionRepo.findByCondition({ candidate_id: c._id.toString() })// search candidate by name
                if (listCandidateIntroducion.length !== 0) {
                    listCandidateIdApplied.push(c._id.toString())
                }
            }
            const listPostId = await this._postRepo.findPostIdByCondition(conditionSearchPost) // search post by title
            let conditionOr = []
            conditionOr.push({ post_id: { $in: listPostId } })
            conditionOr.push({ candidate_id: { $in: listCandidateIdApplied } })
            condition.$or = conditionOr

            delete condition.keyword
            let listCandidateIntroduction = await this._candidateIntroductionRepo.findCandidateIntroductionByCondition(condition, sort)
            //let listCandidateIntroduction = result.data

            let listReturn = []
            for (let candidateIntroduction of listCandidateIntroduction) {
                let flag = true

                const post = await this._postRepo.getById(candidateIntroduction.post_id)
                //
                let newestStatus = await this._statusHistoryRepo.getNewestStatus(candidateIntroduction._id.toString())
                if (listCompany.length !== 0 && !listCompany.includes(post.company_id.toString())) {
                    flag = false
                } else if (status !== null && status !== newestStatus.status) {
                    flag = false
                }
                if (flag) {
                    const candidate = await this._candidateRepo.getById(candidateIntroduction.candidate_id)
                    let tmp = {
                        candidate_introduction_id: candidateIntroduction._id,
                        candidate_name: candidate.name,
                        post_title: post.title,
                        guarantee_type: post.guarantee_type,
                        status: newestStatus.status,
                        introduction_date: candidateIntroduction.introduction_date
                    }
                    listReturn.push(tmp)
                }

            }
            if (sortBy === 1) { // sort name
                listReturn = listReturn.sort((a, b) => a.candidate_name.toLowerCase().localeCompare(b.candidate_name.toLowerCase()))
            } else if (sortBy === 2) { // sort post title
                listReturn = listReturn.sort((a, b) => a.post_title.toLowerCase().localeCompare(b.post_title.toLowerCase()))
            }
            const totalCount = listReturn.length
            listReturn = listReturn.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)
            const dtoReturn = {
                pageIndex,
                pageSize,
                totalPages: Math.ceil(totalCount / pageSize),
                totalCount: totalCount,
                message: 'Success',
                status: 0,
                candidateIntroductions: listReturn
            }
            return dtoReturn
        }
        return {
            pageIndex: 0,
            pageSize: 0,
            totalPages: 0,
            totalCount: 0,
            message: 'Permission is required',
            status: 1,
            candidateIntroductions: []
        }
    }

    public async searchCandidateIntroductionOfCollaborator(bearerToken: string, condition, pageIndex: number, pageSize: number, sortBy: number): Promise<{
        pageIndex: number,
        pageSize: number,
        totalPages: number,
        totalCount: number,
        candidateIntroductions: any[],
        message: string,
        status: number
    }> {
        const employer = this._jwtToken.getUserInfo(bearerToken)
        if (employer.permission.includes('collaborator.all') || employer.permission.includes('collaborator.search')) {
            let sort = {};
            if (sortBy === 0) {
                sort['introduction_date'] = -1
            }
            if (condition.introduction_date_to !== undefined && condition.introduction_date_from !== undefined) { // search gt lt
                condition.introduction_date = { $gte: condition.introduction_date_from, $lte: condition.introduction_date_to }
            } else if (condition.introduction_date_to === undefined && condition.introduction_date_from !== undefined) {// search gt
                condition.introduction_date = { $gte: condition.introduction_date_from }
            } else if (condition.introduction_date_to !== undefined && condition.introduction_date_from === undefined) { // search lt
                condition.introduction_date = { $lte: condition.introduction_date_to }
            }

            delete condition.introduction_date_to
            delete condition.introduction_date_from
            let status = condition.status
            switch (status) {
                case '0':
                    status = null
                    break;
                case '1': // Pending
                    status = IntroductionStatus.PENDING
                    break;
                case '2':
                    status = IntroductionStatus.DECLINE
                    break;
                case '3':
                    status = IntroductionStatus.EMPLOYER_ACCEPT
                    break;
                case '4':
                    status = IntroductionStatus.VIEWED
                    break;
                case '5':
                    status = IntroductionStatus.REJECT
                    break;
                case '6':
                    status = IntroductionStatus.COMPANY_ACCEPT
                    break;
                case '7':
                    status = IntroductionStatus.SEND_TEST
                    break;
                case '8':
                    status = IntroductionStatus.SUBMIT_TEST
                    break;
                case '9':
                    status = IntroductionStatus.FAILED_TEST
                    break;
                case '10':
                    status = IntroductionStatus.PASSED_TEST
                    break;
                case '11':
                    status = IntroductionStatus.SCHEDULE
                    break;
                case '12':
                    status = IntroductionStatus.REJECT_INTERVIEW
                    break;
                case '13':
                    status = IntroductionStatus.INTERVIEWED
                    break;
                case '14':
                    status = IntroductionStatus.FAILED_INTERVIEW
                    break;
                case '15':
                    status = IntroductionStatus.OFFER
                    break;
                case '16':
                    status = IntroductionStatus.ONBOARD
                    break;
                case '17':
                    status = IntroductionStatus.RESIGN
                    break;
                case '18':
                    status = IntroductionStatus.COMPLETED
                    break;
                default:
                    break;
            }
            delete condition.status
            let conditionSearchPost = {
                title: { $regex: condition.keyword, $options: 'i' }
            }
            let listCompany: string[] = []
            if (condition.company_ids === '0') {
                delete condition.company_ids
            } else {
                listCompany = condition.company_ids.split(',')
                conditionSearchPost['company_id'] = { $in: listCompany }
                delete condition.company_ids
            }
            let collaborator_id = condition.collaborator_id
            let listIntroductionId = []
            //get list candidate by name
            const listCandidate = await this._candidateRepo.findByCondition(
                { name: { $regex: condition.keyword, $options: 'i' }, collaborator_id: collaborator_id })
            if (listCandidate.length !== 0) {
                for (let c of listCandidate) {
                    const listCandidateIntroducion = await this._candidateIntroductionRepo.findByCondition({ candidate_id: c._id.toString() })// search candidate by name
                    if (listCompany.length !== 0) {
                        for (let introduction of listCandidateIntroducion) {
                            const post = await this._postRepo.getById(introduction.post_id)
                            if (listCompany.includes(post.company_id.toString())) {
                                listIntroductionId.push(introduction._id.toString())
                            }
                        }
                    } else {

                        for (let introduction of listCandidateIntroducion) {
                            listIntroductionId.push(introduction._id.toString())
                        }
                    }
                }
            }
            const listPostId = await this._postRepo.findPostIdByCondition(conditionSearchPost)
            //get all candidate of collab
            const allCandidates = await this._candidateRepo.findByCondition({ collaborator_id: collaborator_id })
            delete condition.collaborator_id
            delete condition.keyword
            let allCandidateId = []
            allCandidates.map(candidate => allCandidateId.push(candidate._id.toString()))
            condition.post_id = { $in: listPostId }
            condition.candidate_id = { $in: allCandidateId }
            //get list candidate introduction by post title
            let listCandidateIntroduction = await this._candidateIntroductionRepo.findCandidateIntroductionByCondition(condition, sort)
            for (let introduction of listCandidateIntroduction) {
                if (!listIntroductionId.includes(introduction._id.toString())) {
                    listIntroductionId.push(introduction._id.toString())
                }
            }

            const listObjectids = listIntroductionId.map(function (id) { return new ObjectId(id); });
            const searchCondition = { _id: { $in: listObjectids } }
            const introductionResult = await this._candidateIntroductionRepo.findByConditionAndPaging(searchCondition, pageIndex * pageSize, pageSize, sort)
            let listReturn = []

            for (let candidateIntroduction of introductionResult.data) {
                let flag = true

                const post = await this._postRepo.getById(candidateIntroduction.post_id)

                let newestStatus = await this._statusHistoryRepo.getNewestStatus(candidateIntroduction._id.toString())
                if (listCompany.length !== 0 && !listCompany.includes(post.company_id.toString())) {
                    introductionResult.infoPaging.totalDocs--
                    flag = false
                } else if (status !== null && status !== newestStatus.status) {
                    flag = false
                }

                if (flag) {
                    const candidate = await this._candidateRepo.getById(candidateIntroduction.candidate_id)
                    let tmp = {
                        candidate_introduction_id: candidateIntroduction._id,
                        candidate_name: candidate.name,
                        post_title: post.title,
                        guarantee_type: post.guarantee_type,
                        status: newestStatus.status,
                        introduction_date: candidateIntroduction.introduction_date
                    }
                    listReturn.push(tmp)
                }

            }
            if (sortBy === 1) { // sort name
                listReturn = listReturn.sort((a, b) => a.candidate_name.toLowerCase().localeCompare(b.candidate_name.toLowerCase()))
            } else if (sortBy === 2) { // sort post title
                listReturn = listReturn.sort((a, b) => a.post_title.toLowerCase().localeCompare(b.post_title.toLowerCase()))
            }

            const dtoReturn = {
                pageIndex,
                pageSize,
                totalPages: introductionResult.infoPaging.totalPages,
                totalCount: introductionResult.infoPaging.totalDocs,
                message: 'Success',
                status: 0,
                candidateIntroductions: listReturn
            }
            return dtoReturn
        }
        return {
            pageIndex: 0,
            pageSize: 0,
            totalPages: 0,
            totalCount: 0,
            message: 'Permission is required',
            status: 1,
            candidateIntroductions: []
        }
    }

    public async searchCandidateIntroductionForCollaborator(bearerToken: string, condition, pageIndex: number, pageSize: number, sortBy: number): Promise<{
        pageIndex: number,
        pageSize: number,
        totalPages: number,
        totalCount: number,
        candidateIntroductions: any[]
    }> {
        const userData = await this._jwtToken.getUserInfo(bearerToken)
        let sort = {};
        if (sortBy === 0) {
            sort['_id'] = -1

        }
        let conditionFinally: any = {}
        if (condition.introduction_date_to !== undefined && condition.introduction_date_from !== undefined) { // search gt lt
            conditionFinally.introduction_date = { $gte: condition.introduction_date_from, $lte: condition.introduction_date_to }
        } else if (condition.introduction_date_to === undefined && condition.introduction_date_from !== undefined) {// search gt
            conditionFinally.introduction_date = { $gte: condition.introduction_date_from }
        } else if (condition.introduction_date_to !== undefined && condition.introduction_date_from === undefined) { // search lt
            conditionFinally.introduction_date = { $lte: condition.introduction_date_to }
        }

        delete condition.introduction_date_to
        delete condition.introduction_date_from
        let status = condition.status
        switch (status) {
            case '0':
                status = null
                break;
            case '1': // Pending
                status = IntroductionStatus.PENDING
                break;
            case '2':
                status = IntroductionStatus.DECLINE
                break;
            case '3':
                status = IntroductionStatus.EMPLOYER_ACCEPT
                break;
            case '4':
                status = IntroductionStatus.VIEWED
                break;
            case '5':
                status = IntroductionStatus.REJECT
                break;
            case '6':
                status = IntroductionStatus.COMPANY_ACCEPT
                break;
            case '7':
                status = IntroductionStatus.SEND_TEST
                break;
            case '8':
                status = IntroductionStatus.SUBMIT_TEST
                break;
            case '9':
                status = IntroductionStatus.FAILED_TEST
                break;
            case '10':
                status = IntroductionStatus.PASSED_TEST
                break;
            case '11':
                status = IntroductionStatus.SCHEDULE
                break;
            case '12':
                status = IntroductionStatus.REJECT_INTERVIEW
                break;
            case '13':
                status = IntroductionStatus.INTERVIEWED
                break;
            case '14':
                status = IntroductionStatus.FAILED_INTERVIEW
                break;
            case '15':
                status = IntroductionStatus.OFFER
                break;
            case '16':
                status = IntroductionStatus.ONBOARD
                break;
            case '17':
                status = IntroductionStatus.RESIGN
                break;
            case '18':
                status = IntroductionStatus.COMPLETED
                break;
            default:
                break;
        }
        delete condition.status

        let conditionSearchPost = {
            title: { $regex: condition.keyword, $options: 'i' }
        }
        let listCompany: string[] = []
        if (condition.company_ids === '0') {
            delete condition.company_ids
        } else {
            listCompany = condition.company_ids.split(',')
            conditionSearchPost['company_id'] = { $in: listCompany }
            delete condition.company_ids
        }
        const listCandidateId = await this._candidateRepo.getListIdByCondition({ name: { $regex: condition.keyword, $options: 'i' }, collaborator_id: userData.id })
        let listCandidateIdApplied = []
        if (listCandidateId.length !== 0) {
            for (let c of listCandidateId) {
                const listCandidateIntroducion = await this._candidateIntroductionRepo.findByCondition({ candidate_id: c })
                if (listCandidateIntroducion.length !== 0) {
                    listCandidateIdApplied.push(c)
                }
            }
        }
        let conditionOr = []
        conditionOr.push({ candidate_id: { $in: listCandidateIdApplied } })
        const listPostId = await this._postRepo.getListIdByCondition(conditionSearchPost)
        conditionOr.push({ post_id: { $in: listPostId } })

        conditionFinally.$or = conditionOr
        const listCandidateIntroduction = []
        const listResult = await this._candidateIntroductionRepo.findCandidateIntroductionByCondition(conditionFinally, sort)
        for (let candidateIntroduction of listResult) {
            const candidate = await this._candidateRepo.getById(candidateIntroduction.candidate_id)
            if (candidate.collaborator_id === userData.id) {
                listCandidateIntroduction.push(candidateIntroduction)
            }
        }

        delete condition.keyword
        let listReturn = []
        for (let candidateIntroduction of listCandidateIntroduction) {
            let flag = true
            const post = await this._postRepo.getById(candidateIntroduction.post_id)

            const newestStatus = await this._statusHistoryRepo.getNewestStatus(candidateIntroduction._id.toString());
            if (listCompany.length !== 0 && !listCompany.includes(post.company_id.toString())) {
                flag = false
            } else if (status !== null && status !== newestStatus.status) {
                flag = false
            }
            if (flag) {
                const candidate = await this._candidateRepo.getById(candidateIntroduction.candidate_id)

                const company = await this._companyRepo.getById(post.company_id)
                const cvFile = await this._fileRepo.getById(candidate.cv_id)
                const filename = path.basename(cvFile.path)
                let pathFile = Constants.pathStaticFixedCv + filename
                let tmp = {
                    candidate_introduction_id: candidateIntroduction._id,
                    candidate_name: candidate.name,
                    phone: candidate.phone,
                    cv: pathFile,
                    post_title: post.title,
                    guarantee_type: post.guarantee_type,
                    status: newestStatus.status,
                    company: company.company,
                    introduction_date: candidateIntroduction.introduction_date
                }
                listReturn.push(tmp)
            }
        }
        const totalCount = listReturn.length
        let totalPages = Math.ceil(totalCount / pageSize)
        if (totalPages === 0) {
            totalPages = 1
        }
        if (sortBy === 1) { // sort name
            listReturn = listReturn.sort((a, b) => a.candidate_name.toLowerCase().localeCompare(b.candidate_name.toLowerCase()))
        } else if (sortBy === 2) { // sort post title
            listReturn = listReturn.sort((a, b) => a.post_title.toLowerCase().localeCompare(b.post_title.toLowerCase()))
        }
        listReturn = listReturn.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)

        const dtoReturn = {
            pageIndex,
            pageSize,
            totalPages,
            totalCount,
            candidateIntroductions: listReturn
        }
        return dtoReturn
    }

    public async cancelRefer(bearerToken: string, candidateIntroductionId: string, postId: string, reason: string): Promise<{ message: string, status: number }> {
        const userData = this._jwtToken.getUserInfo(bearerToken)
        const collaborator = await this._userRepo.getById(userData.id)
        if (collaborator !== null) {
            if (collaborator.status === 'approval') {
                const post = await this._postRepo.getById(postId)
                if (post !== null) {
                    const candidateIntroduction = await this._candidateIntroductionRepo.getById(candidateIntroductionId)
                    const candidate = await this._candidateRepo.getById(candidateIntroduction.candidate_id)
                    if (candidate.collaborator_id !== collaborator._id.toString()) {
                        return { message: 'The candidate is not belong to the collaborator', status: 3 }
                    }
                    if (candidateIntroduction !== null) {
                        if (candidateIntroduction.post_id === postId) {
                            const listCandidateIntroductionStatusHistory = await this._statusHistoryRepo.findByCondition({ candidate_introduction_id: candidateIntroduction._id.toString() })
                            //const regexStatus = /^(Employer Accept)|(Company Viewed)|(Company Accept)|(Send Test)|(Candidate Submit Test)|(Passed Test)|(Schedule Interview)|(Interviewed)|(Offer)$/
                            const statusNewest = await this._statusHistoryRepo.getNewestStatus(candidateIntroduction._id.toString())
                            if (listCandidateIntroductionStatusHistory.length === 1 && statusNewest.status === IntroductionStatus.PENDING) { // chỉ có dag pending mới được cancel
                                const resultDelete = await this._statusHistoryRepo.delete(statusNewest._id.toString())
                                if (resultDelete) {
                                    await this._candidateIntroductionRepo.delete(candidateIntroduction._id)
                                    console.log(reason); // send mail with reason
                                    return { message: 'Cancel refer success', status: 0 }
                                }
                            }
                            return { message: 'Can not cancel refer the candidate without status pending', status: 4 }
                        }
                        return { message: 'The candidate introduction and post is not match', status: 1 }
                    }
                    return { message: 'The candidate introduction is not found', status: 1 }
                }
                return { message: 'The post is not found', status: 1 }
            }
            return { message: 'The collaborator is not approval', status: 2 }
        }
        return { message: 'The collaborator is not found', status: 1 }
    }
    public async updateStatusHistory(bearerToken: string, candidateIntroductionId: string, onboardDate: string, workEndDate: string, note: string, status: string): Promise<{ statusHistoryId: string, message: string, status: number }> {
        const employer = this._jwtToken.getUserInfo(bearerToken)
        if (employer.permission.includes('candidate.all') || employer.permission.includes('candidate.update_status')) {
            const candidateIntroduction = await this._candidateIntroductionRepo.getById(candidateIntroductionId)
            if (candidateIntroduction !== null) {
                const post = await this._postRepo.getById(candidateIntroduction.post_id);
                if (post !== null) {
                    let candidateIntroduction = await this._candidateIntroductionRepo.getById(candidateIntroductionId) //
                    const newestIntroduction = await this._candidateIntroductionRepo.findCandidateIntroductionByCondition({ candidate_id: candidateIntroduction.candidate_id }, { _id: 1 })
                    if (newestIntroduction[newestIntroduction.length - 1].post_id !== candidateIntroduction.post_id) {
                        return { statusHistoryId: '', message: 'The candidate has been referred for another job ', status: 9 }
                    }
                    switch (status) {
                        case '1': // Pending
                            status = IntroductionStatus.PENDING
                            break;
                        case '2':
                            status = IntroductionStatus.DECLINE
                            break;
                        case '3':
                            status = IntroductionStatus.EMPLOYER_ACCEPT
                            break;
                        case '4':
                            status = IntroductionStatus.VIEWED
                            break;
                        case '5':
                            status = IntroductionStatus.REJECT
                            break;
                        case '6':
                            status = IntroductionStatus.COMPANY_ACCEPT
                            break;
                        case '7':
                            status = IntroductionStatus.SEND_TEST
                            break;
                        case '8':
                            status = IntroductionStatus.SUBMIT_TEST
                            break;
                        case '9':
                            status = IntroductionStatus.FAILED_TEST
                            break;
                        case '10':
                            status = IntroductionStatus.PASSED_TEST
                            break;
                        case '11':
                            status = IntroductionStatus.SCHEDULE
                            break;
                        case '12':
                            status = IntroductionStatus.REJECT_INTERVIEW
                            break;
                        case '13':
                            status = IntroductionStatus.INTERVIEWED
                            break;
                        case '14':
                            status = IntroductionStatus.FAILED_INTERVIEW
                            break;
                        case '15':
                            status = IntroductionStatus.OFFER
                            break;
                        case '16':
                            status = IntroductionStatus.ONBOARD
                            break;
                        case "17":
                            status = IntroductionStatus.COMPLETED
                            break;
                        case "18":
                            status = IntroductionStatus.RESIGN
                            break;
                        default:
                            status = '0'
                            break;
                    }
                    if (status === '0') {
                        return { statusHistoryId: '', message: 'The status is not found', status: 1 }
                    }
                    let placement: Placement = null
                    const listPlacement = await this._placementRepo.findByCondition({ candidate_introduction_id: candidateIntroduction._id.toString() })
                    if (listPlacement.length !== 0) {
                        placement = listPlacement[0]
                        if (status !== IntroductionStatus.ONBOARD && status !== IntroductionStatus.COMPLETED && status !== IntroductionStatus.RESIGN) {
                            return { statusHistoryId: '', message: 'Only onboard, completed and regin status are allowed if this candidate has placement', status: 2 }
                        }
                    }

                    if (candidateIntroduction.post_id !== post._id.toString()) {
                        return { statusHistoryId: '', message: 'The candidate introduction and post not match', status: 4 }
                    }
                    if (onboardDate !== null && status !== IntroductionStatus.OFFER && status !== IntroductionStatus.ONBOARD && status !== IntroductionStatus.RESIGN && status !== IntroductionStatus.COMPLETED) {
                        return { statusHistoryId: '', message: 'Can not input onboard date if status is not offer, resign, onboard or complete', status: 2 }
                    }
                    if (workEndDate !== null && status !== IntroductionStatus.RESIGN) {
                        return { statusHistoryId: '', message: 'Can not input work end date if status is not resign', status: 2 }
                    }
                    if (status === IntroductionStatus.RESIGN && onboardDate === null) { // bỏ workEndDate === null ||
                        return { statusHistoryId: '', message: 'Please input onboard date if status is resign', status: 3 }
                    }
                    if ((status === IntroductionStatus.OFFER || status === IntroductionStatus.ONBOARD) && onboardDate === null) {
                        return { statusHistoryId: '', message: 'Please input onboard date if status is offer or onboard', status: 3 }
                    }
                    let onboardDateNumber: number = null
                    if (onboardDate !== null) {
                        onboardDateNumber = parseInt(onboardDate)
                    }
                    let workEndDateNumber: number = null
                    if (workEndDate !== null) {
                        workEndDateNumber = parseInt(workEndDate)
                    }

                    if (status === IntroductionStatus.COMPLETED && onboardDateNumber !== candidateIntroduction.onboard_date) { //  complete r thì không cho đổi ngày onboard nữa
                        return { statusHistoryId: '', message: 'Can not change onboard date if status is Completed ', status: 2 }
                    }
                    if (status === IntroductionStatus.COMPLETED) { // bỏ || status === IntroductionStatus.RESIGN
                        if (placement === null) {
                            return { statusHistoryId: '', message: 'Please create placement before update status to completed', status: 6 }
                        }
                    }
                    if (status === IntroductionStatus.COMPLETED || status === IntroductionStatus.ONBOARD) {
                        const checkCandidateWarranty = await this._warrantyRepo.findByCondition({ guaranteed_candidate_introuduction_id: candidateIntroductionId })
                        if (checkCandidateWarranty.length !== 0) {
                            return { statusHistoryId: '', message: 'Can not change status if this candidate introduction has alternative candidate introduction (Warranty)', status: 7 }
                        }
                    }

                    // update status moi
                    const candidateIntroductionStatusHistory: CandidateIntroductionStatusHistory = {
                        _id: undefined,
                        candidate_introduction_id: candidateIntroductionId,
                        status: status,
                        time: new Date().getTime(),
                        note: note,
                        is_disable: false
                    }
                    if (status === IntroductionStatus.RESIGN && workEndDate !== null) { // nếu fail phải nhập ngày
                        if (workEndDateNumber < onboardDateNumber) {
                            return { statusHistoryId: '', message: 'Work end date must be greater than onboard date ', status: 8 }
                        }
                        candidateIntroduction = await this._candidateIntroductionRepo.update(candidateIntroduction._id.toString(), { work_end_date: workEndDateNumber })
                    } else { // đề phòng trường hợp nó nhập sai cho nhập lại thì phải cập nhật work end date thành null
                        await this._candidateIntroductionRepo.update(candidateIntroduction._id.toString(), { work_end_date: null })
                    }
                    const result = await this._statusHistoryRepo.create(candidateIntroductionStatusHistory)
                    const resultUpdate = await this._candidateIntroductionRepo.update(candidateIntroductionId, { onboard_date: onboardDateNumber })
                    const candidate = await this._candidateRepo.getById(candidateIntroduction.candidate_id)


                    // check xem thag nào có bảo hành cho ai không
                    const checkWarranty = await this._warrantyRepo.findByCondition({ alternative_candidate_introuduction_id: candidateIntroductionId })

                    if (post.guarantee_type === JobGuarantee.PERIODICWARRANTY) { // bảo hành theo giai đoạn
                        if (status === IntroductionStatus.ONBOARD || status === IntroductionStatus.COMPLETED) { // nếu update onboard cho post bảo hành theo giai đoạn
                            if (checkWarranty.length !== 0) { // thag minhf dag update status dag bao hanh cho mot thag khac
                                await this._warrantyRepo.update(checkWarranty[0]._id.toString(), { status: 'Completed' })
                            }
                        }

                        // tất cả trạng thái update ko phải là onboard và completed
                        // nếu update lộn là onboard cho job bao hành theo giai đoạn
                        if (status !== IntroductionStatus.ONBOARD && status !== IntroductionStatus.COMPLETED) {
                            if (checkWarranty.length !== 0) { // thag minhf dag update status dag bao hanh cho mot thag khac
                                await this._warrantyRepo.update(checkWarranty[0]._id.toString(), { status: 'Not Complete' })
                            }
                        }
                        if (status === IntroductionStatus.RESIGN) {
                            //await this._warrantyRepo.update(listWarrantyNotCompleteOfCollab[0]._id.toString(),{alternative_candidate_introuduction_id: candidateIntroductionId, status: 'Failed'})
                            if (checkWarranty.length !== 0) { // thag minhf dag update status dag bao hanh cho mot thag khac
                                //await this._warrantyRepo.update(checkWarranty[0]._id.toString(), { status: 'Failed' })
                            }
                            if (placement !== null) {
                                let lengthStatus = placement.payment_status.length
                                placement.payment_status[lengthStatus - 1] = PaymentStatus.PAYMENTFAILED
                                await this._placementRepo.update(placement._id.toString(), { payment_status: placement.payment_status })
                            }

                        }

                    } else if (post.guarantee_type === JobGuarantee.COMPREHENSIVEWARRANTY) {// toàn diện

                        if (status === IntroductionStatus.COMPLETED) {
                            if (checkWarranty.length !== 0) { // thag minhf dag update status dag bao hanh cho mot thag khac
                                await this._warrantyRepo.update(checkWarranty[0]._id.toString(), { status: 'Completed' })
                            }
                        }
                        // chọn lộn chọn lại
                        if (status !== IntroductionStatus.COMPLETED) { // bỏ status !== IntroductionStatus.ONBOARD && 
                            if (checkWarranty.length !== 0) { // thag minhf dag update status dag bao hanh cho mot thag khac
                                if (workEndDate !== null) {
                                    let workedNumberDay = workEndDateNumber - onboardDateNumber
                                    let difference_In_Days = workedNumberDay / (1000 * 3600 * 24)
                                    if (difference_In_Days < checkWarranty[0].number_of_warranty_days) {
                                        await this._warrantyRepo.update(checkWarranty[0]._id.toString(), { status: 'Not Complete' })
                                    }
                                }
                            }
                        }
                        // nếu fail thì bảo hành này fail luôn
                        if (status === IntroductionStatus.DECLINE || status === IntroductionStatus.REJECT || status === IntroductionStatus.FAILED_TEST || status === IntroductionStatus.FAILED_INTERVIEW || status === IntroductionStatus.RESIGN) {
                            if (checkWarranty.length !== 0) { // thag minhf dag update status dag bao hanh cho mot thag khac
                                await this._warrantyRepo.update(checkWarranty[0]._id.toString(), { status: 'Failed' })

                            }
                        }

                        // coi laij casi resign 
                        if (status === IntroductionStatus.RESIGN) { // tạo bảo hành cho job toàn diện

                            if (checkWarranty.length !== 0) { // thag minhf dag update status dag bao hanh cho mot thag khac
                                await this._warrantyRepo.update(checkWarranty[0]._id.toString(), { status: 'Failed' })
                            }

                            if (placement !== null) {
                                let lengthStatus = placement.payment_status.length
                                placement.payment_status[lengthStatus - 1] = PaymentStatus.PAYMENTFAILED
                                await this._placementRepo.update(placement._id.toString(), { payment_status: placement.payment_status })
                            }


                        }
                    }
                    const collaborator = await this._userRepo.getById(candidate.collaborator_id)
                    let data = { title: 'Cập nhật trạng thái ứng viên', content: `Ứng cử viên ${candidate.name} được cập nhật trạng thái ` + status }
                    let notifyDto = new Notification()
                    notifyDto.title = data.title
                    notifyDto.content = data.content
                    notifyDto.type = NotifyType.REFER_CANDIDATE
                    notifyDto.time = new Date().getTime()
                    notifyDto.link = TAtatoolUrl.REFER_CANDIDATE_DETAIL + candidateIntroductionId
                    notifyDto.image = NotifyIconUrl.INTRODUCTION
                    notifyDto.receiver_id = collaborator._id.toString()
                    const notifyRecord = await this._notifyRepo.create(notifyDto)
                    if (collaborator.fcm_token !== null) {
                        sendNotification(collaborator.fcm_token, data)
                    }
                    if (status === IntroductionStatus.COMPLETED) {
                        await this._candidateRepo.update(candidate._id.toString(), { status: CandidateStatus.HADJOB })
                    } else {
                        await this._candidateRepo.update(candidate._id.toString(), { status: CandidateStatus.LOOKINGJOB })
                    }
                    return { statusHistoryId: result._id.toString(), message: 'Success', status: 0 }
                }
                return { statusHistoryId: '', message: 'The post is not found', status: 1 }
            }
            return { statusHistoryId: '', message: 'The candidate introduction is not found', status: 1 }
        }
        return { statusHistoryId: '', message: 'Permission is required', status: 5 }
    }

    public async exportToExcel(dataToExport: any[]): Promise<string> {
        const filename = 'Referal_list_' + new Date().getTime() + '.xlsx'
        const columns = [
            { header: 'Introduction ID', key: 'candidate_introduction_id' },
            { header: 'Candidate name', key: 'candidate_name' },
            { header: 'Post title', key: 'post_title' },
            { header: 'Company', key: 'company' },
            { header: 'Phone', key: 'phone' },
            { header: 'CV', key: 'cv' },
            { header: 'Status', key: 'status' },
            { header: 'Introduction date', key: 'introduction_date' }
        ]
        // const dataSample: CandidateIntroductionToExcel[] =[
        //     {
        //         candidate_introduction_id: "60d4d43944d40b5b3c0c4a5a",
        //         candidate_name:"Nguyễn Đức Hiệp",
        //         company:"FPT",
        //         // cv:{
        //         //     text: 'View CV',
        //         //     hyperlink: 'https://static.recruitery.co/uploads/cv/02eeb4aec1824f0c89984c3018cfe058_20210509232437_13275.pdf',
        //         //     tooltip: 'View Cv'
        //         // },
        //         introduction_date: "25/12/2020",
        //         phone: "0338546575",
        //         post_title: "Backend developer cscskcosoavpnvnapvnspavnaovnaops",
        //         status: "Pending",
        //         link_cv: '/static/cv/haophan.pdf'
        //     },
        //     {
        //         //https://static.recruitery.co/uploads/cv/02eeb4aec1824f0c89984c3018cfe058_20210509232437_13275.pdf
        //         candidate_introduction_id: "60d4d43944d40b5b3c0c4a52",
        //         candidate_name:"Trương Phan Văn Hào",
        //         company:"FPT",
        //         // cv:{
        //         //     text: '&IView cv',
        //         //     hyperlink: 'http://localhost:3000'+'',
        //         //     tooltip: 'www.mylink.com'
        //         // },                
        //         introduction_date: "25/12/2020",
        //         phone: "032854657",
        //         post_title: "Java web backend developere",
        //         status: "Employer accepted",
        //         link_cv: '/static/cv/haophan.pdf '
        //     }
        // ] 
        for (let data of dataToExport) {
            const link_cv = data['cv']
            data['cv'] = {
                text: 'View CV',
                hyperlink: 'http://localhost:3000' + link_cv,
                tooltip: 'View CV'
            }
        }
        const pathExcel = await exportExcel(columns, dataToExport, filename, 'Candidate Introduction')
        return pathExcel
    }

    public async getReportForStatistic(token: string, reportBy: string, date: string, number: number, statuses: Array<string>): Promise<{ data: {}, message: string, status: number }> {
        const userInfo = this._jwtToken.getUserInfo(token)
        if (userInfo.type_account === 'employer' && !userInfo.permission.includes('statistic.all') && !userInfo.permission.includes('statistic.search')) {
            return { data: null, status: 1, message: "Permission is required" }
        }
        var checkDate = date.split('-')
        if (reportBy === 'year' && (checkDate[1] !== '12' || checkDate[2] !== '31')) {
            return { data: null, message: 'Invalid date', status: 1 }
        }
        let searchDate = new Date(date)
        searchDate.setDate(searchDate.getDate() + 1)
        const checkForMonth = searchDate.toISOString().split('T')[0]
        checkDate = checkForMonth.split('-')
        if (reportBy === 'month' && checkDate[2] !== '01') {
            return { data: null, message: 'Invalid date', status: 1 }
        }
        let listPeriod = []
        for (let i = 0; i < number; i++) {
            if (reportBy === 'date') {
                let period
                if (i === 0) {
                    let startDate = new Date(searchDate.getTime())
                    startDate.setDate(searchDate.getDate() - 1)
                    period = { start: startDate, end: searchDate }
                } else {
                    let startDate = new Date(listPeriod[i - 1].start.getTime())
                    let endDate = new Date(listPeriod[i - 1].end.getTime())
                    startDate.setDate(startDate.getDate() - 1)
                    endDate.setDate(endDate.getDate() - 1)
                    period = { start: startDate, end: endDate }
                }
                listPeriod.push(period)
            } else if (reportBy === 'month') {
                let period
                if (i === 0) {
                    let startDate = new Date(searchDate.getTime())
                    startDate.setMonth(searchDate.getMonth() - 1)
                    period = { start: startDate, end: searchDate }
                } else {
                    let startDate = new Date(listPeriod[i - 1].start.getTime())
                    let endDate = new Date(listPeriod[i - 1].end.getTime())
                    startDate.setMonth(startDate.getMonth() - 1)
                    endDate.setMonth(endDate.getMonth() - 1)
                    period = { start: startDate, end: endDate }
                }
                listPeriod.push(period)
            } else if (reportBy === 'year') {
                let period
                if (i === 0) {
                    let startDate = new Date(searchDate.getTime())
                    startDate.setFullYear(searchDate.getFullYear() - 1)
                    period = { start: startDate, end: searchDate }
                } else {
                    let startDate = new Date(listPeriod[i - 1].start.getTime())
                    let endDate = new Date(listPeriod[i - 1].end.getTime())
                    startDate.setFullYear(startDate.getFullYear() - 1)
                    endDate.setFullYear(endDate.getFullYear() - 1)
                    period = { start: startDate, end: endDate }
                }
                listPeriod.push(period)
            }
        }
        let listResult = []
        for (let period of listPeriod) {

            const condition = {
                introduction_date: {
                    $gte: period.start.getTime(),
                    $lt: period.end.getTime()
                }
            }
            const listIntroduction = await this._candidateIntroductionRepo.findByCondition(condition)
            let jobRefer = []
            let pending = 0, decline = 0, employerAccept = 0, viewed = 0, reject = 0, companyAccept = 0, sendTest = 0, submitTest = 0, completed = 0, resign = 0
            let failedTest = 0, passedTest = 0, schedule = 0, rejectInterview = 0, interviewed = 0, failedInterview = 0, offer = 0, onboard = 0
            for (let introduction of listIntroduction) {
                if (userInfo.type_account === 'collaborator') {
                    const candidate = await this._candidateRepo.getById(introduction.candidate_id)
                    if (userInfo.id !== candidate.collaborator_id) {
                        continue
                    }
                }
                if (!jobRefer.includes(introduction.post_id)) {
                    jobRefer.push(introduction.post_id)
                }
                const statusHistories = await this._statusHistoryRepo.getStatusHistories({ candidate_introduction_id: introduction._id.toString() },
                    { time: -1 })
                switch (statusHistories[0].status) {
                    case IntroductionStatus.PENDING:
                        pending++
                        break;
                    case IntroductionStatus.DECLINE:
                        decline++
                        break;
                    case IntroductionStatus.EMPLOYER_ACCEPT:
                        employerAccept++
                        break;
                    case IntroductionStatus.VIEWED:
                        viewed++
                        break;
                    case IntroductionStatus.REJECT:
                        reject++
                        break;
                    case IntroductionStatus.COMPANY_ACCEPT:
                        companyAccept++
                        break;
                    case IntroductionStatus.SEND_TEST:
                        sendTest++
                        break;
                    case IntroductionStatus.SUBMIT_TEST:
                        submitTest++
                        break;
                    case IntroductionStatus.FAILED_TEST:
                        failedTest++
                        break;
                    case IntroductionStatus.PASSED_TEST:
                        passedTest++
                        break;
                    case IntroductionStatus.SCHEDULE:
                        schedule++
                        break;
                    case IntroductionStatus.REJECT_INTERVIEW:
                        rejectInterview++
                        break;
                    case IntroductionStatus.INTERVIEWED:
                        interviewed++
                        break;
                    case IntroductionStatus.FAILED_INTERVIEW:
                        failedInterview++
                        break;
                    case IntroductionStatus.OFFER:
                        offer++
                        break;
                    case IntroductionStatus.RESIGN:
                        resign++
                        break;
                    case IntroductionStatus.ONBOARD:
                        onboard++
                        break;
                    case IntroductionStatus.COMPLETED:
                        completed++
                        break;
                    default:
                        break;
                }
            }
            let total = 0
            let result = {}
            if (statuses.includes('Job Refer')) {
                result['job_refer'] = jobRefer.length
            }
            if (statuses.includes(IntroductionStatus.PENDING)) {
                result['pending'] = pending
                total += pending
            }
            if (statuses.includes(IntroductionStatus.DECLINE)) {
                result['employer_decline'] = decline
                total += decline
            }
            if (statuses.includes(IntroductionStatus.EMPLOYER_ACCEPT)) {
                result['employer_accept'] = employerAccept
                total += employerAccept
            }
            if (statuses.includes(IntroductionStatus.VIEWED)) {
                result['company_viewed'] = viewed
                total += viewed
            }
            if (statuses.includes(IntroductionStatus.REJECT)) {
                result['company_reject'] = reject
                total += reject
            }
            if (statuses.includes(IntroductionStatus.COMPANY_ACCEPT)) {
                result['company_accept'] = companyAccept
                total += companyAccept
            }
            if (statuses.includes(IntroductionStatus.SEND_TEST)) {
                result['send_test'] = sendTest
                total += sendTest
            }
            if (statuses.includes(IntroductionStatus.SUBMIT_TEST)) {
                result['submit_test'] = submitTest
                total += submitTest
            }
            if (statuses.includes(IntroductionStatus.FAILED_TEST)) {
                result['failed_test'] = failedTest
                total += failedTest
            }
            if (statuses.includes(IntroductionStatus.PASSED_TEST)) {
                result['passed_test'] = passedTest
                total += passedTest
            }
            if (statuses.includes(IntroductionStatus.SCHEDULE)) {
                result['schedule'] = schedule
                total += schedule
            }
            if (statuses.includes(IntroductionStatus.REJECT_INTERVIEW)) {
                result['reject_interview'] = rejectInterview
                total += rejectInterview
            }
            if (statuses.includes(IntroductionStatus.INTERVIEWED)) {
                result['interviewed'] = interviewed
                total += interviewed
            }
            if (statuses.includes(IntroductionStatus.FAILED_INTERVIEW)) {
                result['failed_interview'] = failedInterview
                total += failedInterview
            }
            if (statuses.includes(IntroductionStatus.OFFER)) {
                result['offer'] = offer
                total += offer
            }
            if (statuses.includes(IntroductionStatus.RESIGN)) {
                result['resign'] = resign
                total += resign
            }
            if (statuses.includes(IntroductionStatus.ONBOARD)) {
                result['onboard'] = onboard
                total += onboard
            }
            if (statuses.includes(IntroductionStatus.COMPLETED)) {
                result['completed'] = completed
                total += completed
            }
            const arrayDate = period.start.toISOString().split('T')[0].split('-')
            if (reportBy === 'date') {
                result['date'] = arrayDate[2] + '-' + arrayDate[1] + '-' + arrayDate[0]
            } else if (reportBy === 'month') {
                result['date'] = arrayDate[1] + '-' + arrayDate[0]
            } else if (reportBy === 'year') {
                result['date'] = arrayDate[0]
            }
            result['total'] = total
            listResult.push(result)
        }
        return { data: listResult, message: "Success", status: 0 }
    }

    public async getReportForPosts(token: string, postIds: string[]): Promise<{ data: {}, message: string, status: number }> {
        const userInfo = this._jwtToken.getUserInfo(token)
        if (userInfo.permission.includes('statistic.all') || userInfo.permission.includes('statistic.search')) {
            const listIntroduction = await this._candidateIntroductionRepo.findByCondition({ post_id: { $in: postIds } })
            let pending = 0, employerAccept = 0, companyAccept = 0, interviewed = 0, offer = 0, onboard = 0, completed = 0
            for (let introduction of listIntroduction) {
                const statusHistories = await this._statusHistoryRepo.getStatusHistories({ candidate_introduction_id: introduction._id.toString() },
                    { time: -1 })
                switch (statusHistories[0].status) {
                    case IntroductionStatus.PENDING:
                        pending++
                        break;
                    case IntroductionStatus.EMPLOYER_ACCEPT:
                        employerAccept++
                        break;
                    case IntroductionStatus.COMPANY_ACCEPT:
                        companyAccept++
                        break;
                    case IntroductionStatus.INTERVIEWED:
                        interviewed++
                        break;
                    case IntroductionStatus.OFFER:
                        offer++
                        break;
                    case IntroductionStatus.ONBOARD:
                        onboard++
                        break;
                    case IntroductionStatus.COMPLETED:
                        completed++
                        break;
                    default:
                        break;
                }
            }
            onboard += completed
            offer += onboard
            interviewed += offer
            companyAccept += interviewed
            employerAccept += companyAccept
            pending += employerAccept
            const result = {
                pending: pending,
                employerAccept: employerAccept,
                companyAccept: companyAccept,
                interviewed: interviewed,
                offer: offer,
                onboard: onboard,
                completed: completed
            }
            return { data: result, message: 'Success', status: 0 }
        }
        return { data: null, message: 'Permission is required', status: 1 }
    }

    public async inviteTest(token: string, candidate_introduction_id: string, email: string, question_packages: any[], invited_at: number, expired: number): Promise<{ message: string, status: number }> {
        const userInfo = this._jwtToken.getUserInfo(token)
        if (userInfo.permission.includes('candidate.all') || userInfo.permission.includes('candidate.invite_test')) {
            const introduction = await this._candidateIntroductionRepo.getById(candidate_introduction_id)
            if (introduction === null) {
                return { message: 'Candidate introduction not found', status: 1 }
            }
            let member_id = await this._inviteTestService.getEmailMemberId(email)
            if (member_id === '') {
                member_id = await this._inviteTestService.createEmailMember(email)
            }
            let tatoolToken = `Bearer ${process.env.TATOOL_TOKEN}`
            const userInviteInfo = this._jwtToken.getUserInfo(tatoolToken)
            for (let question_package of question_packages) {
                const sendTestResult = await this._inviteTestService.inviteTest(question_package, member_id, invited_at, expired, userInviteInfo.sub)
                if (sendTestResult.status !== 0) {
                    return sendTestResult
                } else {
                    let introductionTestDto = new CandidateIntroductionTest
                    introductionTestDto.candidate_introduction_id = candidate_introduction_id
                    introductionTestDto.invite_test_id = sendTestResult.data['_id']
                    introductionTestDto.question_package_id = question_package._id
                    introductionTestDto.invite_at = new Date().getTime()
                    const introductionTestRecord = await this._introductionTestRepo.create(introductionTestDto)
                }
            }
            return { message: 'Invite success', status: 0 }
        }
        return { message: 'Permission is required', status: 1 }
    }

    public async chooseCandidateToWarranty(candidateIntroductionGuaranteedId: string, candidateIntroductionAlternativeId: string): Promise<{ message: string, status: number }> {
        const listWarrantyOfCandidate = await this._warrantyRepo.findByCondition({ guaranteed_candidate_introuduction_id: candidateIntroductionGuaranteedId })
        const candidateIntroductionGuaranteed = await this._candidateIntroductionRepo.getById(candidateIntroductionGuaranteedId)
        if (candidateIntroductionGuaranteed === null) {
            return { message: 'This candidate guaranteed is not found', status: 1 }
        }
        const newestStatusOfGuaranteedCandidate = await this._statusHistoryRepo.getNewestStatus(candidateIntroductionGuaranteedId)
        if (newestStatusOfGuaranteedCandidate.status !== IntroductionStatus.RESIGN || candidateIntroductionGuaranteed.work_end_date === null) {
            return { message: 'The status candidate guaranteed must be resign and the candidate guaranteed has work end date', status: 3 }
        }
        const post = await this._postRepo.getById(candidateIntroductionGuaranteed.post_id)
        if (post === null) {
            return { message: 'This post is not found', status: 1 }
        }
        const candidateIntroductionAlternative = await this._candidateIntroductionRepo.getById(candidateIntroductionAlternativeId)
        if (candidateIntroductionAlternative === null) {
            return { message: 'This candidate alternative is not found', status: 1 }
        }
        if (candidateIntroductionAlternative.post_id !== candidateIntroductionGuaranteed.post_id) { // 
            return { message: 'The alternative candidate must apply for the same job as the guaranteed candidate.', status: 2 }
        }
        const newestStatus = await this._statusHistoryRepo.getNewestStatus(candidateIntroductionAlternativeId)
        if (newestStatus === null) {
            return { message: 'This candidate has been not referred for the job', status: 4 }
        }
        if (newestStatus.status !== IntroductionStatus.OFFER) {
            return { message: 'The status candidate alternative must be offer', status: 3 }
        }
        const checkAlternativeCandidate = await this._warrantyRepo.findByCondition({ alternative_candidate_introuduction_id: candidateIntroductionAlternativeId })
        if (checkAlternativeCandidate.length !== 0) { // thag bảo hành phải chưa bảo hành cho ai hết
            return { message: 'The alternative candidate has guaranteed another candidate', status: 5 }
        }
        let number_of_warranty_days = post.guarantee_date // mặc định là làm đủ ngày job yêu cầu
        let difference_In_Time = 0
        let difference_In_Days = 0
        if (candidateIntroductionGuaranteed.work_end_date !== null) {
            difference_In_Time = candidateIntroductionGuaranteed.work_end_date - candidateIntroductionGuaranteed.onboard_date; // thag cuối cùng bảo hành làm dc nhiêu ngày rồi
            // To calculate the no. of days between two dates
            difference_In_Days = difference_In_Time / (1000 * 3600 * 24)
            number_of_warranty_days = number_of_warranty_days - difference_In_Days
            if (number_of_warranty_days <= 0) {
                return { message: 'The candidate do not need to warranty', status: 5 }
            }
        }
        if (post.guarantee_type === JobGuarantee.PERIODICWARRANTY) { // nếu job là theo giai đoạns
            number_of_warranty_days = 0
            if (listWarrantyOfCandidate.length > 1) { // job bảo hành theo giai đoạn không nhiều quá một người bảo hành
                return { message: 'Only one guarantor for periodic warranty job', status: 6 }
            }

        } else if (post.guarantee_type === JobGuarantee.COMPREHENSIVEWARRANTY) { // nếu job là toàn diện
            // không phải bảo hành lần đầu
            if (listWarrantyOfCandidate.length > 0) {
                const lastWarranty = listWarrantyOfCandidate[listWarrantyOfCandidate.length - 1] // nếu list ứng viên đã bảo hành trước đó (nếu có)
                if (lastWarranty.status === 'Failed') { // thag lần cuối bảo hành phải fail mới dc bảo hành tiếp
                    for (let tmp of listWarrantyOfCandidate) { // nếu thag này đã bảo hành cho thag bị resign kia r thì thôi
                        if (tmp.alternative_candidate_introuduction_id === candidateIntroductionAlternativeId) {
                            return { message: 'The alternative candidate is already on the wararanty list', status: 7 }
                        }
                    }
                    const lastCandidateIntroductionWarranty = await this._candidateIntroductionRepo.getById(lastWarranty.alternative_candidate_introuduction_id)
                    if (lastCandidateIntroductionWarranty.work_end_date !== null) {
                        difference_In_Time = lastCandidateIntroductionWarranty.work_end_date - lastCandidateIntroductionWarranty.onboard_date; // thag cuối cùng bảo hành làm dc nhiêu ngày rồi
                        // To calculate the no. of days between two dates
                        difference_In_Days = difference_In_Time / (1000 * 3600 * 24)
                        number_of_warranty_days = lastWarranty.number_of_warranty_days - difference_In_Days // chỉ cần làm số ngày mà thag bảo hành trước đó nó thiếu
                        if (number_of_warranty_days <= 0) {
                            return { message: 'The candidate do not need to guarantee', status: 5 }
                        }
                    }

                    //const result = await this._warrantyRepo.update(warrantyId, {alternative_candidate_introuduction_id: candidateIntroductionAlternativeId})
                    // if(result !== null){
                    //     return {message: 'Success', status: 0}
                    // }
                } else {
                    return { message: 'The last candidate alternative is not fail', status: 3 }
                }

            }
        }
        const warranty: Warranty = {
            _id: undefined,
            guaranteed_candidate_introuduction_id: candidateIntroductionGuaranteedId,
            alternative_candidate_introuduction_id: candidateIntroductionAlternativeId,
            status: 'Not complete',
            warranty_start_date: candidateIntroductionAlternative.onboard_date,
            number_of_warranty_days
        }
        const result = await this._warrantyRepo.create(warranty)
        if (result !== null) {
            return { message: 'Success', status: 0 }
        }
        return { message: 'Failed', status: 8 }
    }

    public async searchCandidateIntroductionToWarranty(bearerToken: string, condition, pageIndex: number, pageSize: number, sortBy: number): Promise<{
        pageIndex: number,
        pageSize: number,
        totalPages: number,
        totalCount: number,
        candidateIntroductions: any[],
        message: string,
        status: number
    }> {
        const userData = await this._jwtToken.getUserInfo(bearerToken)

        let sort = {};
        if (sortBy === 0) {
            sort['_id'] = -1

        }
        const post = await this._postRepo.getById(condition.postId)
        delete condition.postId
        if (post === null) {
            return {
                pageIndex: 0,
                pageSize: 0,
                totalPages: 0,
                totalCount: 0,
                candidateIntroductions: [],
                message: 'The post is not found',
                status: 1
            }
        }
        if (post.status !== 'active') {
            return {
                pageIndex: 0,
                pageSize: 0,
                totalPages: 0,
                totalCount: 0,
                candidateIntroductions: [],
                message: 'The post is not active',
                status: 2
            }
        }

        const listCandidateId = await this._candidateRepo.getListIdByCondition({ name: { $regex: condition.keyword, $options: 'i' }, collaborator_id: userData.id })
        let listCandidateIdApplied = []
        if (listCandidateId.length !== 0) {
            for (let c of listCandidateId) {
                const listCandidateIntroducion = await this._candidateIntroductionRepo.findByCondition({ candidate_id: c, post_id: post._id.toString() })// search candidate by name
                if (listCandidateIntroducion.length !== 0) {
                    listCandidateIdApplied.push(c)
                }
            }
        }

        condition.candidate_id = { $in: listCandidateIdApplied }
        condition.post_id = post._id.toString()
        delete condition.keyword
        let listCandidateIntroduction = await this._candidateIntroductionRepo.findCandidateIntroductionByCondition(condition, sort)

        let listReturn = []
        for (let candidateIntroduction of listCandidateIntroduction) {
            // check xem tahg nay da bao hanh cho ai chua
            const checkWarranty = await this._warrantyRepo.findByCondition({ alternative_candidate_introuduction_id: candidateIntroduction._id.toString() })
            if (checkWarranty.length === 0) {
                const candidate = await this._candidateRepo.getById(candidateIntroduction.candidate_id)
                const statusNewest = await this._statusHistoryRepo.getNewestStatus(candidateIntroduction._id.toString());
                if (statusNewest.status === IntroductionStatus.OFFER) {
                    const post = await this._postRepo.getById(candidateIntroduction.post_id)
                    const company = await this._companyRepo.getById(post.company_id)
                    const cvFile = await this._fileRepo.getById(candidate.cv_id)
                    const filename = path.basename(cvFile.path)
                    let pathFile = Constants.pathStaticFixedCv + filename
                    let tmp = {
                        candidate_introduction_id: candidateIntroduction._id,
                        candidate_name: candidate.name,
                        phone: candidate.phone,
                        cv: pathFile,
                        post_title: post.title,
                        status: statusNewest.status,
                        company: company.company,
                        introduction_date: candidateIntroduction.introduction_date
                    }
                    listReturn.push(tmp)
                }

            }
        }
        const totalCount = listReturn.length
        let totalPages = Math.ceil(totalCount / pageSize)
        if (totalPages === 0) {
            totalPages = 1
        }
        if (sortBy === 1) { // sort name
            listReturn = listReturn.sort((a, b) => a.candidate_name.toLowerCase().localeCompare(b.candidate_name.toLowerCase()))
        }
        listReturn = listReturn.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)

        const dtoReturn = {
            pageIndex,
            pageSize,
            totalPages,
            totalCount,
            candidateIntroductions: listReturn,
            message: 'Success',
            status: 0
        }
        return dtoReturn
    }

    public async getReportTest(token: string, candidate_introduction_id: string, question_packages: any[]): Promise<{ data: any, message: string, status: number }> {
        const userInfo = this._jwtToken.getUserInfo(token)
        if (userInfo.type_account === 'collaborator' || (userInfo.type_account === 'employer'
            && (userInfo.permission.includes('candidate.all') || userInfo.permission.includes('candidate.invite_test')))) {
            let result = []
            for (let question_package of question_packages) {
                const introductionTests = await this._introductionTestRepo.getReports({ candidate_introduction_id: candidate_introduction_id, question_package_id: question_package._id }, {})
                let listReports = []
                for (let introductionTest of introductionTests) {
                    delete introductionTest.question_package_id
                    if (introductionTest.percents === null) {
                        const report = await this._inviteTestService.getTestReport(introductionTest.invite_test_id)
                        if (report !== null && report.data.length > 0) {
                            const updateTestRecord = this._introductionTestRepo.update(introductionTest._id.toString(), {
                                report_id: report.data[0]._id,
                                scores: report.data[0].scores,
                                percents: report.data[0].percents
                            })
                            introductionTest.report_id = report.data[0]._id
                            introductionTest.scores = report.data[0].scores
                            introductionTest.percents = report.data[0].percents
                        }
                    }
                    listReports.push(introductionTest)
                }
                let testReturnDto = { question_package: question_package, reports: listReports }
                result.push(testReturnDto)
            }
            return { data: result, message: 'Success', status: 0 }
        }
        return { data: null, status: 1, message: "Permission is required" }
    }
}