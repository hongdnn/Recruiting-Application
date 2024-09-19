import { injectable } from 'inversify'
import { Model, Document, PaginateModel } from 'mongoose';
import { BaseRepository, IBaseRepository } from './base.repository';
import { InterviewSchedule } from '../entities/interview_schedule';

export interface IInterviewScheduleRepository extends IBaseRepository<InterviewSchedule> {
    findInterviewByCondition(condition, sortBy: {}): Promise<InterviewSchedule[]>
    getScheduleByCondition(condition): Promise<InterviewSchedule| null>
}

@injectable()
export class InterviewScheduleRepository extends BaseRepository<InterviewSchedule> implements IInterviewScheduleRepository {
    constructor(mongooseModel: PaginateModel<Document<InterviewSchedule>>) {
        super(mongooseModel)
    }
    public async findInterviewByCondition(condition, sortBy: {}): Promise<InterviewSchedule[]>{
        const result = await this._mongooseModel.find(condition).sort(sortBy);
        let listInterview:InterviewSchedule[] = [] 
        result.map(d => listInterview.push(d.toObject<InterviewSchedule>()))
        return listInterview
     }

     public async getScheduleByCondition(condition): Promise<InterviewSchedule| null> {
        const result = await this._mongooseModel.findOne(condition)
        if(result !== null) {
            return result.toObject<InterviewSchedule>();
        }
        return null
     }
}
