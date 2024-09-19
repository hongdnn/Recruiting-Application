import { injectable } from 'inversify'
import { Model, Document, PaginateModel } from 'mongoose';
import { BaseRepository, IBaseRepository } from './base.repository';
import { InterviewScheduleStatusHistory } from '../entities/interview_schedule_status_history';

export interface IInterviewScheduleStatusHistoryRepository extends IBaseRepository<InterviewScheduleStatusHistory> {
    findStatusHistoryByCondition(condition, sortBy: {}): Promise<InterviewScheduleStatusHistory[] | []>
}

@injectable()
export class InterviewScheduleStatusHistoryRepository extends BaseRepository<InterviewScheduleStatusHistory> implements IInterviewScheduleStatusHistoryRepository {
    constructor(mongooseModel: PaginateModel<Document<InterviewScheduleStatusHistory>>) {
        super(mongooseModel)
    }

    public async findStatusHistoryByCondition(condition, sortBy: {}): Promise<InterviewScheduleStatusHistory[] | []>{
        const result = await this._mongooseModel.find(condition).sort(sortBy);
        if(result.length === 0){
           return []
        }
        let scheduleStatusHistories:InterviewScheduleStatusHistory[] = [] 
        result.map(d => scheduleStatusHistories.push(d.toObject<InterviewScheduleStatusHistory>()))
        return scheduleStatusHistories
    }  
}
