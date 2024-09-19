import { inject, injectable } from "inversify";
import { InterviewStatus } from "../../common/constants";
import { InterviewScheduleStatusHistory } from "../../entities/interview_schedule_status_history";
import { Token } from "../../JwtToken/JwtToken";
import { IInterviewScheduleRepository } from "../../repositories/interview_schedule.repository";
import { IInterviewScheduleStatusHistoryRepository } from "../../repositories/interview_schedule_status_history.repository";
import { TYPES } from "../../types";

export interface IInterviewScheduleStatusHistoryService {
    updateStatusHistory(token: string, id: string, updateField: {}): Promise<{ message: string, status: number }>
}

@injectable()
export class InterviewScheduleStatusHistoryService implements IInterviewScheduleStatusHistoryService {
    @inject(TYPES.IInterviewScheduleStatusHistoryRepository) private readonly _statusHistoryRepo: IInterviewScheduleStatusHistoryRepository
    @inject(TYPES.IInterviewScheduleRepository) private readonly _scheduleRepo: IInterviewScheduleRepository
    @inject(TYPES.Token) private readonly _jwtToken: Token

    public async updateStatusHistory(token: string, id: string, updateField: {}): Promise<{ message: string, status: number }> {
        const userInfo = this._jwtToken.getUserInfo(token)
        if (userInfo.permission.includes('interview.all') || userInfo.permission.includes('interview.update_status')) {
            const statusHistory = await this._statusHistoryRepo.getById(id)
            if (statusHistory !== null) {
                const schedule = await this._scheduleRepo.getById(statusHistory.interview_schedule_id)
                if (schedule !== null) {
                    const date = new Date().getTime()
                    if (schedule.interview_start_date > date && updateField['status'] !== InterviewStatus.CANCEL && updateField['status'] !== InterviewStatus.WAITING) {
                        return { message: "Status not allowed", status: 1 }
                    }
                    const disableRecord = await this._statusHistoryRepo.update(id, { is_disable: true })
                    const statusDto = new InterviewScheduleStatusHistory()
                    statusDto.interview_schedule_id = statusHistory.interview_schedule_id
                    statusDto.time = statusHistory.time
                    if (updateField['status'] !== undefined) {
                        statusDto.status = updateField['status']
                    } else {
                        statusDto.status = statusHistory.status
                    }
                    if (updateField['reason'] !== undefined) {
                        statusDto.reason = updateField['reason']
                    } else {
                        statusDto.reason = statusHistory.reason
                    }
                    const newRecord = await this._statusHistoryRepo.create(statusDto)
                    return { message: 'Update success', status: 0 }
                }
                return { message: "Schedule not found", status: 1 }
            }
            return { message: "Status history not found", status: 1 }
        }
        return { message: "Permission is required", status: 1 }
    }
}