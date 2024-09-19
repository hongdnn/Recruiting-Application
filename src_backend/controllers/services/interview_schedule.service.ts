import { inject, injectable } from "inversify";
import { ICandidateRepository } from "../../repositories/candidate.repository";
import { ICandidateIntroductionRepository } from "../../repositories/candidate_introduction.repository";
import { IInterviewRepository } from "../../repositories/interview.repository";
import { IPostRepository } from "../../repositories/post.repository";
import { TYPES } from "../../types";
import _ from 'underscore'
import { Token } from "../../JwtToken/JwtToken";
import { IInterviewScheduleRepository } from "../../repositories/interview_schedule.repository";
import { IUserRepository } from "../../repositories/user.repository";
import { InterviewSchedule } from "../../entities/interview_schedule";
import { sendNotification } from "../../firebase";
import { InterviewStatus, NotifyIconUrl, NotifyType, TAtatoolUrl } from "../../common/constants";
import { MailService } from "../../mail.service";
import { createCalendar, deleteCalendar } from "../../calendar";
import { ICompanyRepository } from "../../repositories/company.repository";
import { IFileRepository } from "../../repositories/file.repository";
import { IInterviewScheduleQuestionRepository } from "../../repositories/interview_schedule_question.repository";
import { InterviewScheduleQuestion } from "../../entities/interview_schedule_question";
import { cancelInvitationContent, invitationContent } from "../../../email_content/email_content";
import { InterviewScheduleStatusHistory } from "../../entities/interview_schedule_status_history";
import { IInterviewScheduleStatusHistoryRepository } from "../../repositories/interview_schedule_status_history.repository";
import { Notification } from "../../entities/notification";
import { INotificationRepository } from "../../repositories/notification.repository";

export interface IInterviewScheduleService {
    searchInterviewSchedule(token: any, condition: any, pageIndex: number, pageSize: number, sortBy: number):
        Promise<{
            pageIndex: number, pageSize: number, totalPages: number, totalCount: number, schedules: any[], message: string,
            status: number
        }>
    createInterviewSchedule(token: string, schedule: InterviewSchedule, google_meet: boolean): Promise<{ message: string, status: number }>
    updateInterviewSchedule(token: string, id: string, updateFields: {}, google_meet): Promise<{ message: string, status: number }>
    updateScheduleStatus(token: string, id: string, updateField: {}): Promise<{ message: string, status: number }>
    getScheduleDetail(token: string, id: string): Promise<{ data: {}, message: string, status: number }>
    updateScheduleQuestions(oken: string, id: string, questions: any[]): Promise<{ message: string, status: number }>
}

@injectable()
export class InterviewScheduleService implements IInterviewScheduleService {
    @inject(TYPES.IInterviewScheduleRepository) private readonly _scheduleRepo: IInterviewScheduleRepository
    @inject(TYPES.IInterviewRepository) private readonly _interviewRepo: IInterviewRepository
    @inject(TYPES.ICandidateRepository) private readonly _candidateRepo: ICandidateRepository
    @inject(TYPES.IUserRepository) private readonly _userRepo: IUserRepository
    @inject(TYPES.IPostRepository) private readonly _postRepo: IPostRepository
    @inject(TYPES.ICompanyRepository) private readonly _companyRepo: ICompanyRepository
    @inject(TYPES.IFileRepository) private readonly _fileRepo: IFileRepository
    @inject(TYPES.IInterviewScheduleQuestionRepository) private readonly _scheduleQuestionRepo: IInterviewScheduleQuestionRepository
    @inject(TYPES.ICandidateIntroductionRepository) private readonly _introductionRepo: ICandidateIntroductionRepository
    @inject(TYPES.IInterviewScheduleStatusHistoryRepository) private readonly _statusHistoryRepo: IInterviewScheduleStatusHistoryRepository
    @inject(TYPES.Token) private readonly _jwtToken: Token
    @inject(TYPES.MailService) private readonly _mailService: MailService
    @inject(TYPES.INotificationRepository) private readonly _notifyRepo: INotificationRepository
    //@inject(TYPES.MailService) private readonly _jwtToken: Token

    public async searchInterviewSchedule(token: any, condition: any, pageIndex: number, pageSize: number, sortBy: number):
        Promise<{
            pageIndex: number, pageSize: number, totalPages: number, totalCount: number, schedules: any[], message: string,
            status: number,
        }> {
        const userInfo = this._jwtToken.getUserInfo(token)
        if (userInfo.type_account === 'employer' && !userInfo.permission.includes('interview.all') && !userInfo.permission.includes('interview.search')) {
            return { pageIndex, pageSize, totalPages: 0, totalCount: 0, schedules: [], status: 1, message: "Permission is required" }
        }
        const offset = pageSize * pageIndex
        const skip = (pageSize * pageIndex) - pageSize
        const listPost = await this._postRepo.findByCondition({ title: { $regex: condition.keyword, $options: 'i' } })
        let candidateCondition = { name: { $regex: condition.keyword, $options: 'i' } }
        if (userInfo.type_account === 'collaborator') {
            candidateCondition['collaborator_id'] = userInfo.id
        }
        const listCandidate = await this._candidateRepo.findByCondition(candidateCondition)
        let listIntroduction = []
        for (var i = 0; i < listCandidate.length; i++) {
            const introductions = await this._introductionRepo.findByCondition({ candidate_id: listCandidate[i]._id })
            for (var j = 0; j < introductions.length; j++) {
                introductions[j]._id = introductions[j]._id.toString()
                if (_.findWhere(listIntroduction, { _id: introductions[j]._id }) === undefined) {
                    listIntroduction.push(introductions[j])
                }
            }
        }
        for (var i = 0; i < listPost.length; i++) {
            const introductions = await this._introductionRepo.findByCondition({ post_id: listPost[i]._id })
            for (var j = 0; j < introductions.length; j++) {
                introductions[j]._id = introductions[j]._id.toString()
                if (_.findWhere(listIntroduction, { _id: introductions[j]._id }) === undefined) {
                    if (userInfo.type_account === 'collaborator') {
                        const candidate = await this._candidateRepo.getById(introductions[j].candidate_id)
                        if (candidate.collaborator_id === userInfo.id) {
                            listIntroduction.push(introductions[j])
                        }
                    } else {
                        listIntroduction.push(introductions[j])
                    }
                }

            }
        }
        let introductionIds = []
        let companies = []
        if (condition.company_id !== '0') {
            companies = condition.company_id.split(',')
        }
        for (var i = 0; i < listIntroduction.length; i++) {
            if (condition.company_id !== '0') {
                const post = await this._postRepo.getById(listIntroduction[i].post_id)
                if (companies.includes(post.company_id)) {
                    introductionIds.push(listIntroduction[i]._id)
                }
            } else {
                introductionIds.push(listIntroduction[i]._id)
            }
        }
        condition.candidate_introduction_id = { $in: introductionIds }
        delete condition.keyword
        delete condition.company_id
        let searchStatus
        if (condition.status === 1) {
            searchStatus = InterviewStatus.WAITING
        } else if (condition.status === 2) {
            searchStatus = InterviewStatus.INTERVIEWING
        } else if (condition.status === 3) {
            searchStatus = InterviewStatus.CANCEL
        } else if (condition.status === 4) {
            searchStatus = InterviewStatus.SUCCESS
        } else if (condition.status === 5) {
            searchStatus = InterviewStatus.FAILED
        }
        delete condition.status
        let sort = {};
        if (sortBy === -2) {
            sort['interview_start_date'] = -1
        } else if (sortBy === 2) {
            sort['interview_start_date'] = 1
        } else if (sortBy === -3) {
            sort['interview_end_date'] = -1
        } else if (sortBy === 3) {
            sort['interview_end_date'] = 1
        } else if (sortBy === -1) {
            sort['_id'] = -1
        } else if (sortBy === 1) {
            sort['_id'] = 1
        }
        const resultData = await this._scheduleRepo.findByConditionAndPaging(condition,offset, pageSize, sort)
        const listDataSchedules = resultData.data
        let listResult = []
        for (var i = 0; i < listDataSchedules.length; i++) {
            const introduction = await this._introductionRepo.getById(listDataSchedules[i].candidate_introduction_id)
            const post = await this._postRepo.getById(introduction.post_id)
            const candidate = await this._candidateRepo.getById(introduction.candidate_id)
            const interview = await this._interviewRepo.getById(listDataSchedules[i].interview_id)
            const statusHistories = await this._statusHistoryRepo.findStatusHistoryByCondition({ interview_schedule_id: listDataSchedules[i]._id.toString() }, { time: -1 })
            const result = {
                id: listDataSchedules[i]._id,
                candidate: { _id: candidate._id, name: candidate.name },
                post: { _id: post._id, name: post.title },
                type: interview.type,
                refer_date: introduction.introduction_date,
                interview_start_date: listDataSchedules[i].interview_start_date,
                interview_end_date: listDataSchedules[i].interview_end_date,
                stage: interview.stage,
                stage_description: interview.stage_description,
                note: listDataSchedules[i].note,
                status: statusHistories[0].status,
            }
            listResult.push(result)
        }
        if (searchStatus !== undefined) {
            listResult = listResult.filter(result => result.status === searchStatus)
        }
        //const totalCount = listResult.length
        //listResult = listResult.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)
        if (sortBy === -1 || sortBy === 1) {
            listResult.sort((a, b) => (a.refer_date > b.refer_date) ? sortBy : ((b.refer_date > a.refer_date) ? -sortBy : 0))
        }
        const result = {
            pageIndex,
            pageSize,
            totalPages: resultData.infoPaging.totalPages,
            totalCount: resultData.infoPaging.totalDocs,
            schedules: listResult,
            message: 'Success',
            status: 0
        }
        return result
    }

    public async createInterviewSchedule(token: string, schedule: InterviewSchedule, google_meet: boolean): Promise<{ message: string, status: number }> {
        const userInfo = this._jwtToken.getUserInfo(token)
        if (userInfo.permission.includes('candidate.all') || userInfo.permission.includes('candidate.create_interview')) {
            const introduction = await this._introductionRepo.getById(schedule.candidate_introduction_id)
            if (introduction !== null) {
                const interview = await this._interviewRepo.getById(schedule.interview_id)
                if (interview !== null) {
                    if (interview.type !== 'face to face' && schedule.supervisor_id !== undefined) {
                        return { message: "supervisor_id not allow for this interview type", status: 1 }
                    }
                    if (interview.type !== 'online' && google_meet === true) {
                        return { message: "google_meet not allow for this interview type", status: 1 }
                    }
                    let supervisor = null
                    if (schedule.supervisor_id !== undefined) {
                        supervisor = await this._userRepo.getById(schedule.supervisor_id)
                        if (supervisor !== null) {
                            const listSchedule = await this._scheduleRepo.findInterviewByCondition({ candidate_introduction_id: schedule.candidate_introduction_id }, {})
                            for (let itvSchedule of listSchedule) {
                                if (schedule['interview_end_date'] < itvSchedule.interview_start_date || schedule['interview_start_date'] > itvSchedule.interview_end_date) {
                                    continue
                                } else {
                                    return { message: "overlap time with another interview schedule", status: 1 }
                                }
                            }
                            const supervisorSchedules = await this._scheduleRepo.findInterviewByCondition({ candidate_introduction_id: { $ne: schedule.candidate_introduction_id }, supervisor_id: schedule.supervisor_id }, {})
                            for (let itvSchedule of supervisorSchedules) {
                                if (schedule['interview_end_date'] < itvSchedule.interview_start_date || schedule['interview_start_date'] > itvSchedule.interview_end_date) {
                                    continue
                                } else {
                                    return { message: "overlap time of supervisor's another interview schedule", status: 1 }
                                }
                            }
                        } else {
                            return { message: 'supervisor_id not found', status: 1 }
                        }
                    }
                    const result = await this._scheduleRepo.create(schedule)
                    let statusHistoryDto = new InterviewScheduleStatusHistory
                    statusHistoryDto.interview_schedule_id = result._id.toString()
                    statusHistoryDto.status = InterviewStatus.WAITING
                    statusHistoryDto.time = new Date().getTime()
                    delete statusHistoryDto._id
                    delete statusHistoryDto.reason
                    const statusHistory = await this._statusHistoryRepo.create(statusHistoryDto)
                    if (result !== null) {
                        const post = await this._postRepo.getById(introduction.post_id)
                        const company = await this._companyRepo.getById(post.company_id)
                        const candidate = await this._candidateRepo.getById(introduction.candidate_id)
                        const collaborator = await this._userRepo.getById(candidate.collaborator_id)
                        let data = { title: 'Lịch phỏng vấn mới', content: `Ứng cử viên ${candidate.name} có lịch phỏng vấn` }
                        let notifyDto = new Notification()
                        notifyDto.title = data.title
                        notifyDto.content = data.content
                        notifyDto.type = NotifyType.INTERVIEW
                        notifyDto.time = new Date().getTime()
                        notifyDto.link = TAtatoolUrl.INTERVIEW_DETAIL + result._id.toString()
                        notifyDto.image = NotifyIconUrl.INTERVIEW
                        notifyDto.receiver_id = collaborator._id.toString()
                        const notifyRecord = await this._notifyRepo.create(notifyDto)
                        if (collaborator.fcm_token !== null) {
                            sendNotification(collaborator.fcm_token, data)
                        }
                        if (google_meet === true) {
                            createCalendar(result._id.toString(), [userInfo.email, candidate.email], result.interview_start_date, result.interview_end_date, result.location, result.note, google_meet, false)
                        } else {
                            createCalendar(result._id.toString(), [userInfo.email, candidate.email], result.interview_start_date, result.interview_end_date, result.location, result.note, false, false)
                        }
                        const sendStartDate = new Date(result.interview_start_date).toString().split(' ').splice(0, 5).join(' ')
                        const sendEndDate = new Date(result.interview_end_date).toString().split(' ').splice(0, 5).join(' ')
                        let content = ''
                        if (schedule['email_content'] !== undefined) {
                            content = schedule['email_content']
                        } else {
                            content = invitationContent
                            content = content.replace("candidate_name", candidate.name)
                            content = content.replace("company_name", company.company)
                            content = content.replace("start_date", sendStartDate)
                            content = content.replace("end_date", sendEndDate)
                            if (result.location !== null) {
                                content = content.replace('interview_location', result.location)
                            } else {
                                content = content.replace('<p><span style="color:#1898be;font-weight: bold;">Địa điểm: </span>interview_location</p>', '')
                            }
                            if (result.note !== null) {
                                content = content.replace('note', result.note)
                            } else {
                                content = content.replace('<p><span style="color:#1898be;font-weight: bold;">Thông tin tham gia: </span>note</p>', '')
                            }
                            if (supervisor !== null) {
                                content = content.replace('candidates', '<li>' + candidate.email + '</li><li>' + supervisor.email + '</li>')
                            } else {
                                content = content.replace('candidates', '<li>' + candidate.email + '</li>')
                            }
                        }
                        let ccEmails = [userInfo.email, collaborator.email]
                        if (result.email.length > 0) {
                            ccEmails = ccEmails.concat(result.email)
                        }
                        if (supervisor !== null) {
                            ccEmails.push(supervisor.email)
                        }
                        const sendEmailResult = await this._mailService.sendMail('hiepnguyen4999@gmail.com', candidate.email, ccEmails, 'Interview invitation letter', content, userInfo.name)
                        return { message: 'Success', status: 0 }
                    }
                } else {
                    return { message: 'interview_id not found', status: 1 }
                }
            }
            return { message: 'candidate_introduction_id not found', status: 1 }
        }
        return { message: "Permission is required", status: 1 }
    }

    public async updateInterviewSchedule(token: string, id: string, updateFields: {}, google_meet): Promise<{ message: string, status: number }> {
        const userInfo = this._jwtToken.getUserInfo(token)
        if (userInfo.permission.includes('interview.all') || userInfo.permission.includes('interview.update')) {
            const interviewSchedule = await this._scheduleRepo.getById(id)
            if (interviewSchedule !== null) {
                const interview = await this._interviewRepo.getById(interviewSchedule.interview_id)
                if (interview.type !== 'face to face' && updateFields['supervisor_id'] !== undefined) {
                    return { message: "supervisor_id not allow for this interview type", status: 1 }
                }
                if (interview.type !== 'online' && google_meet === true) {
                    return { message: "google_meet not allow for this interview type", status: 1 }
                }
                if (updateFields['interview_end_date'] !== undefined || updateFields['interview_start_date'] !== undefined) {
                    if (updateFields['interview_start_date'] === undefined) {
                        if (updateFields['interview_end_date'] > interviewSchedule.interview_start_date) {
                            updateFields['interview_start_date'] = interviewSchedule.interview_start_date
                        } else {
                            return { message: "end_date must after start_date", status: 1 }
                        }
                    }
                    if (updateFields['interview_end_date'] === undefined) {
                        if (updateFields['interview_start_date'] < interviewSchedule.interview_end_date) {
                            updateFields['interview_end_date'] = interviewSchedule.interview_end_date
                        } else {
                            return { message: "start_date must before end_date", status: 1 }
                        }
                    }
                    const listSchedule = await this._scheduleRepo.findInterviewByCondition({ candidate_introduction_id: interviewSchedule.candidate_introduction_id }, {})
                    for (let schedule of listSchedule) {
                        if (schedule._id.toString() !== interviewSchedule._id.toString()) {
                            if (updateFields['interview_end_date'] !== undefined && updateFields['interview_start_date'] !== undefined) {
                                if (updateFields['interview_end_date'] < schedule.interview_start_date || updateFields['interview_start_date'] > schedule.interview_end_date) {
                                    continue
                                } else {
                                    return { message: "overlap time with another interview schedule", status: 1 }
                                }
                            }
                        }
                    }
                    let supervisorSchedules
                    if (updateFields['supervisor_id'] !== undefined) {
                        const supervisor = await this._userRepo.getById(updateFields['supervisor_id'])
                        if (supervisor === null) {
                            return { message: "supervisor_id not found", status: 1 }
                        } else {
                            supervisorSchedules = await this._scheduleRepo.findInterviewByCondition({ candidate_introduction_id: { $ne: interviewSchedule.candidate_introduction_id }, supervisor_id: updateFields['supervisor_id'] }, {})
                        }
                    } else {
                        supervisorSchedules = await this._scheduleRepo.findInterviewByCondition({ candidate_introduction_id: { $ne: interviewSchedule.candidate_introduction_id }, supervisor_id: interviewSchedule.supervisor_id }, {})
                    }
                    for (let itvSchedule of supervisorSchedules) {
                        if (updateFields['interview_end_date'] < itvSchedule.interview_start_date || updateFields['interview_start_date'] > itvSchedule.interview_end_date) {
                            continue
                        } else {
                            return { message: "overlap time of supervisor's another interview schedule", status: 1 }
                        }
                    }
                }

                const statusHistories = await this._statusHistoryRepo.findStatusHistoryByCondition({ interview_schedule_id: id }, { time: -1 })
                if (statusHistories[0].status !== InterviewStatus.WAITING) {
                    let statusHistoryDto = new InterviewScheduleStatusHistory
                    statusHistoryDto.interview_schedule_id = id
                    statusHistoryDto.status = InterviewStatus.WAITING
                    statusHistoryDto.time = new Date().getTime()
                    delete statusHistoryDto._id
                    delete statusHistoryDto.reason
                    const statusHistory = await this._statusHistoryRepo.create(statusHistoryDto)
                }
                const result = await this._scheduleRepo.update(id, updateFields)
                const introduction = await this._introductionRepo.getById(result.candidate_introduction_id)
                const post = await this._postRepo.getById(introduction.post_id)
                const company = await this._companyRepo.getById(post.company_id)
                const candidate = await this._candidateRepo.getById(introduction.candidate_id)
                const collaborator = await this._userRepo.getById(candidate.collaborator_id)
                const supervisor = await this._userRepo.getById(result.supervisor_id)
                let data = { title: 'Cập nhật lịch phỏng vấn', content: `Ứng cử viên ${candidate.name} có lịch phỏng vấn` }
                let notifyDto = new Notification()
                notifyDto.title = data.title
                notifyDto.content = data.content
                notifyDto.type = NotifyType.INTERVIEW
                notifyDto.time = new Date().getTime()
                notifyDto.link = TAtatoolUrl.INTERVIEW_DETAIL + result._id.toString()
                notifyDto.image = NotifyIconUrl.INTERVIEW
                notifyDto.receiver_id = collaborator._id.toString()
                const notifyRecord = await this._notifyRepo.create(notifyDto)
                if (collaborator.fcm_token !== null) {
                    sendNotification(collaborator.fcm_token, data)
                }
                if (google_meet === true) {
                    createCalendar(result._id.toString(), [userInfo.email, candidate.email], result.interview_start_date, result.interview_end_date, result.location, result.note, google_meet, true)
                } else {
                    createCalendar(result._id.toString(), [userInfo.email, candidate.email], result.interview_start_date, result.interview_end_date, result.location, result.note, false, true)
                }
                const sendStartDate = new Date(result.interview_start_date).toString().split(' ').splice(0, 5).join(' ')
                const sendEndDate = new Date(result.interview_end_date).toString().split(' ').splice(0, 5).join(' ')
                let content = ''
                if (updateFields['email_content'] !== undefined) {
                    content = updateFields['email_content']
                } else {
                    content = invitationContent
                    content = content.replace("candidate_name", candidate.name)
                    content = content.replace("company_name", company.company)
                    content = content.replace("start_date", sendStartDate)
                    content = content.replace("end_date", sendEndDate)
                    if (result.location !== null) {
                        content = content.replace('interview_location', result.location)
                    } else {
                        content = content.replace('<p><span style="color:#1898be;font-weight: bold;">Địa điểm: </span>interview_location</p>', '')
                    }
                    if (result.note !== null) {
                        content = content.replace('note', result.note)
                    } else {
                        content = content.replace('<p><span style="color:#1898be;font-weight: bold;">Thông tin tham gia: </span>note</p>', '')
                    }
                    if (supervisor !== null) {
                        content = content.replace('candidates', '<li>' + candidate.email + '</li><li>' + supervisor.email + '</li>')
                    } else {
                        content = content.replace('candidates', '<li>' + candidate.email + '</li>')
                    }
                }
                let ccEmails = [userInfo.email, collaborator.email]
                if (result.email.length > 0) {
                    ccEmails = ccEmails.concat(result.email)
                }
                if (supervisor !== null) {
                    ccEmails.push(supervisor.email)
                }
                const sendEmailResult = await this._mailService.sendMail('hiepnguyen4999@gmail.com', candidate.email, ccEmails, 'Interview invitation letter', content, userInfo.name)
                return { message: 'Update success', status: 0 }
            } else {
                return { message: 'interview_id not found', status: 1 }
            }
        }
        return { message: "Permission is required", status: 1 }
    }

    public async updateScheduleStatus(token: string, id: string, statusHistory: InterviewScheduleStatusHistory): Promise<{ message: string, status: number }> {
        const userInfo = this._jwtToken.getUserInfo(token)
        if (userInfo.permission.includes('interview.all') || userInfo.permission.includes('interview.update_status')) {
            const schedule = await this._scheduleRepo.getById(id)
            if (schedule !== null) {
                statusHistory.time = new Date().getTime()
                if (schedule.interview_start_date > statusHistory.time && statusHistory.status !== InterviewStatus.WAITING
                    && statusHistory.status !== InterviewStatus.CANCEL) {
                    return { message: 'Update this status require after interview_start_date', status: 1 }
                }
                statusHistory.interview_schedule_id = id
                const result = await this._statusHistoryRepo.create(statusHistory)
                if (result !== null) {
                    const introduction = await this._introductionRepo.getById(schedule.candidate_introduction_id)
                    const candidate = await this._candidateRepo.getById(introduction.candidate_id)
                    const collaborator = await this._userRepo.getById(candidate.collaborator_id)
                    if (result.status === InterviewStatus.CANCEL) {
                        const post = await this._postRepo.getById(introduction.post_id)
                        const company = await this._companyRepo.getById(post.company_id)
                        const supervisor = await this._userRepo.getById(schedule.supervisor_id)
                        const sendStartDate = new Date(schedule.interview_start_date).toString().split(' ').splice(0, 5).join(' ')
                        const sendEndDate = new Date(schedule.interview_end_date).toString().split(' ').splice(0, 5).join(' ')
                        let content = cancelInvitationContent
                        content = content.replace("candidate_name", candidate.name)
                        content = content.replace("company_name", company.company)
                        content = content.replace("start_date", sendStartDate)
                        content = content.replace("end_date", sendEndDate)
                        if (result.reason !== null) {
                            content = content.replace('reason', result.reason)
                        } else {
                            content = content.replace('<p>Lí do: reason</p>', '')
                        }
                        if (schedule.location !== null) {
                            content = content.replace('interview_location', schedule.location)
                        } else {
                            content = content.replace('<p><span style="color:#1898be;font-weight: bold;">Địa điểm: </span>interview_location</p>', '')
                        }
                        if (schedule.note !== null) {
                            content = content.replace('note', schedule.note)
                        } else {
                            content = content.replace('<p><span style="color:#1898be;font-weight: bold;">Thông tin tham gia: </span>note</p>', '')
                        }
                        if (supervisor !== null) {
                            content = content.replace('candidates', '<li>' + candidate.email + '</li><li>' + supervisor.email + '</li>')
                        } else {
                            content = content.replace('candidates', '<li>' + candidate.email + '</li>')
                        }
                        let ccEmails = [userInfo.email, collaborator.email]
                        if (schedule.email.length > 0) {
                            ccEmails = ccEmails.concat(schedule.email)
                        }
                        if (supervisor !== null) {
                            ccEmails.push(supervisor.email)
                        }
                        deleteCalendar(id)
                        const sendEmailResult = await this._mailService.sendMail('hiepnguyen4999@gmail.com', candidate.email, ccEmails, 'Interview invitation letter', content, userInfo.name)
                    }
                    let content = `Đã hủy lịch phỏng vấn của ứng cử viên ${candidate.name}`
                    if (result.status === InterviewStatus.FAILED) {
                        content = `Ứng cử viên ${candidate.name} phỏng vấn thất bại`
                    } else if (result.status === InterviewStatus.INTERVIEWING) {
                        content = `Ứng cử viên ${candidate.name} đang phỏng vấn`
                    } else if (result.status === InterviewStatus.SUCCESS) {
                        content = `Ứng cử viên ${candidate.name} phỏng vấn thành công`
                    }
                    let data = { title: 'Cập nhật buổi phỏng vấn', content: content }
                    let notifyDto = new Notification()
                    notifyDto.title = data.title
                    notifyDto.content = data.content
                    notifyDto.type = NotifyType.INTERVIEW
                    notifyDto.time = new Date().getTime()
                    notifyDto.link = TAtatoolUrl.INTERVIEW_DETAIL + id
                    notifyDto.image = NotifyIconUrl.INTERVIEW
                    notifyDto.receiver_id = collaborator._id.toString()
                    const notifyRecord = await this._notifyRepo.create(notifyDto)
                    if (collaborator.fcm_token !== null) {
                        sendNotification(collaborator.fcm_token, data)
                    }
                    return { message: 'Update status success', status: 0 }
                }
            }
            return { message: 'Update status failed', status: 1 }
        }
        return { message: "Permission is required", status: 1 }
    }

    public async getScheduleDetail(token: string, id: string): Promise<{ data: {}, message: string, status: number }> {
        const userInfo = this._jwtToken.getUserInfo(token)
        if (userInfo.type_account === 'employer' && !userInfo.permission.includes('interview.all') && !userInfo.permission.includes('interview.detail')) {
            return { data: null, message: "Permission is required", status: 1 }
        }
        const result = await this._scheduleRepo.getById(id)
        if (result !== null) {
            const introduction = await this._introductionRepo.getById(result.candidate_introduction_id)
            const candidate = await this._candidateRepo.getById(introduction.candidate_id)
            if (userInfo.type_account === 'collaborator' && candidate.collaborator_id !== userInfo.id) {
                return { data: null, message: "Not found", status: 1 }
            }
            const cvRecord = await this._fileRepo.getById(candidate.cv_id)
            const interview = await this._interviewRepo.getById(result.interview_id)
            let supervisor
            if (result.supervisor_id !== null) {
                supervisor = await this._userRepo.getById(result.supervisor_id)
            }
            const statusHistories = await this._statusHistoryRepo.findStatusHistoryByCondition({ interview_schedule_id: id }, { time: -1 })
            const post = await this._postRepo.getById(introduction.post_id)
            const company = await this._companyRepo.getById(post.company_id)
            delete result.candidate_introduction_id
            delete result.interview_id
            delete result.supervisor_id
            result['interview'] = interview
            result['candidate'] = { id: candidate._id, name: candidate.name, email: candidate.email, cv: cvRecord }
            const returnCompany = { id: company._id, name: company.company }
            result['post'] = { id: post._id, title: post.title, company: returnCompany }
            if (supervisor !== undefined) {
                result['supervisor'] = { id: supervisor._id, name: supervisor.first_name + ' ' + supervisor.last_name, email: supervisor.email }
            }
            delete statusHistories[0].interview_schedule_id
            result['status_history'] = statusHistories
            if (userInfo.type_account === 'employer') {
                let questions = []
                for (let questionId of result.question_ids) {
                    const question = await this._scheduleQuestionRepo.getById(questionId)
                    questions.push(question)
                }
                result['questions'] = questions
            }
            delete result.question_ids
            return { data: result, message: 'Success', status: 0 }
        }
        return { data: null, message: "Not found", status: 1 }
    }

    public async updateScheduleQuestions(token: string, id: string, questions: any[]): Promise<{ message: string, status: number }> {
        const userInfo = this._jwtToken.getUserInfo(token)
        if (userInfo.permission.includes('interview.all') || userInfo.permission.includes('interview.question')) {
            const schedule = await this._scheduleRepo.getById(id)
            if (schedule !== null) {
                let questionIds = []
                const currentDate = new Date().getTime()
                for (let question of questions) {
                    if (schedule.interview_start_date > currentDate && question.answer_point !== undefined) {
                        return { message: "Can't add point before schedule start date", status: 1 }
                    }
                    if (question.action === undefined) {
                        return { message: "Action not found", status: 1 }
                    } else if (question.action === null) {
                        const questionRecord = await this._scheduleQuestionRepo.getById(question.id)
                        if (questionRecord !== null) {
                            questionIds.push(question.id)
                        } else {
                            return { message: "Get question failed", status: 1 }
                        }
                    } else if (question.action === "create") {
                        delete question.action
                        const questionDto = new InterviewScheduleQuestion(question)
                        const questionRecord = await this._scheduleQuestionRepo.create(questionDto)
                        if (questionRecord !== null) {
                            questionIds.push(questionRecord._id.toString())
                        } else {
                            return { message: "Create question failed", status: 1 }
                        }
                    } else if (question.action === "update") {
                        if (question.id === undefined) {
                            return { message: "Not found question id for update", status: 1 }
                        }
                        const id = question.id
                        delete question.id
                        delete question.action
                        const questionRecord = await this._scheduleQuestionRepo.update(id, question)
                        if (questionRecord !== null) {
                            questionIds.push(id)
                        } else {
                            return { message: "Update question failed", status: 1 }
                        }
                    } else if (question.action === "delete") {
                        if (question.id === undefined) {
                            return { message: "Not found question id for delete", status: 1 }
                        }
                        const id = question.id
                        const questionRecord = await this._scheduleQuestionRepo.delete(id)
                        if (questionRecord === false) {
                            return { message: "Delete question failed", status: 1 }
                        }
                    }
                }
                const result = await this._scheduleRepo.update(schedule._id, { question_ids: questionIds })
                return { message: "Update questions success", status: 0 }
            }
            return { message: "Interview schedule id not found", status: 1 }
        }
        return { message: "Permission is required", status: 1 }
    }
}