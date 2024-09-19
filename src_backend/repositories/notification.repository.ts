import { injectable } from "inversify";
import { Document, Model, PaginateModel } from "mongoose";
import { Notification } from "../entities/notification";
import { BaseRepository, IBaseRepository } from "./base.repository";

export interface INotificationRepository extends IBaseRepository<Notification> {
    getNotifications(condition, sortBy: {}, pageIndex: number, pageSize: number): Promise<Notification[] | []>
    countNotificationByCondition(condition):Promise<number>
}

@injectable()
export class NotificationRepository extends BaseRepository<Notification> implements INotificationRepository {
    constructor(mongooseModel: PaginateModel<Document<Notification>>) {
        super(mongooseModel)
    }
    public async getNotifications(condition, sortBy: {}, pageIndex: number, pageSize: number): Promise<Notification[] | []> {
        const result = await (await this._mongooseModel.find(condition).sort(sortBy).limit(pageSize).skip(pageIndex * pageSize))
        if (result.length === 0) {
            return []
        }
        let scheduleStatusHistories: Notification[] = []
        result.map(d => scheduleStatusHistories.push(d.toObject<Notification>()))
        return scheduleStatusHistories
    }

    public async countNotificationByCondition(condition):Promise<number>{
        const result = await this._mongooseModel.countDocuments(condition)
        return result
     }
}
