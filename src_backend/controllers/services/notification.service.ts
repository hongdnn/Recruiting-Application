import { inject, injectable } from "inversify";
import { NotifyType } from "../../common/constants";
import { Notification } from "../../entities/notification";
import { Token } from "../../JwtToken/JwtToken";
import { INotificationRepository } from "../../repositories/notification.repository";
import { TYPES } from "../../types";

export interface INotificationService {
    getNotifications(token: string, pageIndex: number, pageSize: number): Promise<{ data: Notification[], pageIndex: number, pageSize: number }>
    updateReadNotification(token: string, id: string): Promise<{ message: string, status: number }>
    countNewNotification(token: string): Promise<{ count: number, message: string, status: number }>
    searchNotification(token: string, condition, pageIndex: number, pageSize: number): Promise<{
        pageIndex: number,
        pageSize: number,
        totalPages: number,
        totalCount: number,
        data: any[]
    }>
    deleteNotification(token: string, id: string): Promise<{ message: string, status: number }>
}


@injectable()
export class NotificationService implements INotificationService {
    @inject(TYPES.INotificationRepository) private readonly _notifyRepo: INotificationRepository
    @inject(TYPES.Token) private readonly _jwtToken: Token

    public async getNotifications(token: string, pageIndex: number, pageSize: number): Promise<{ data: Notification[], pageIndex: number, pageSize: number }> {
        const userInfo = this._jwtToken.getUserInfo(token)
        const listNotification = await this._notifyRepo.getNotifications({ receiver_id: userInfo.id }, { time: -1 }, pageIndex, pageSize);
        return { data: listNotification, pageIndex: pageIndex, pageSize: pageSize }
    }

    public async updateReadNotification(token: string, id: string): Promise<{ message: string, status: number }> {
        const userInfo = this._jwtToken.getUserInfo(token)
        const notifyRecord = await this._notifyRepo.getById(id)
        if (notifyRecord !== null && notifyRecord.receiver_id === userInfo.id) {
            const updateRecord = await this._notifyRepo.update(id, { is_read: true })
            return { message: 'Update success', status: 0 }
        }
        return { message: 'Update failed', status: 1 }
    }

    public async countNewNotification(token: string): Promise<{ count: number, message: string, status: number }> {
        const userInfo = this._jwtToken.getUserInfo(token)
        const result = await this._notifyRepo.countNotificationByCondition({ receiver_id: userInfo.id, is_read: false })
        return { count: result, message: 'Success', status: 0 }
    }

    public async searchNotification(token: string, condition, pageIndex: number, pageSize: number): Promise<{
        pageIndex: number,
        pageSize: number,
        totalPages: number,
        totalCount: number,
        data: any[]
    }> {
        const userInfo = this._jwtToken.getUserInfo(token)
        if (userInfo.type_account === 'collaborator' && condition.type === 3) {
            return { pageIndex, pageSize, totalPages: 0, totalCount: 0, data: [] }
        }
        condition.receiver_id = userInfo.id
        if (condition.type === 1) {
            condition.type = NotifyType.REFER_CANDIDATE
        } else if (condition.type === 2) {
            condition.type = NotifyType.INTERVIEW
        } else if (condition.type === 3) {
            condition.type = NotifyType.STAFF
        } else if (condition.type === 4) {
            condition.type = NotifyType.PLACEMENT
        } else {
            delete condition.type
        }
        let time = {}
        if (condition.date_from !== undefined) {
            time['$gte'] = condition.date_from
            
        }
        if (condition.date_to !== undefined) {
            time['$lte'] = condition.date_to
            
        }
        if (condition.date_from !== undefined || condition.date_to !== undefined) {
            condition.time = time
            delete condition.date_from
            delete condition.date_to
        }
        const offset = pageIndex * pageSize
        const result = await this._notifyRepo.findByConditionAndPaging(condition, offset, pageSize, { time: -1 })
        const dtoReturn = {
            pageIndex,
            pageSize,
            totalPages: result.infoPaging.totalPages,
            totalCount: result.infoPaging.totalDocs,
            data: result.data
        }
        return dtoReturn
    }

    public async deleteNotification(token: string, id: string): Promise<{ message: string, status: number }> {
        const userInfo = this._jwtToken.getUserInfo(token)
        const notifyRecord = await this._notifyRepo.getById(id)
        if (notifyRecord !== null && notifyRecord.receiver_id === userInfo.id) {
            const result = await this._notifyRepo.delete(id)
            return { message: 'Delete success', status: 0 }
        }
        return { message: 'Delete failed', status: 1 }
    }
}