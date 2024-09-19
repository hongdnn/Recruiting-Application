import { injectable } from 'inversify'
import { Model, Document, PaginateModel } from 'mongoose';
import { BaseRepository, IBaseRepository } from './base.repository';
import { Interview } from '../entities/interview';

export interface IInterviewRepository extends IBaseRepository<Interview> {
    findInterviewByCondition(condition, skip:number, limit: number, sortBy: {}): Promise<Interview[]>
}

@injectable()
export class InterviewRepository extends BaseRepository<Interview> implements IInterviewRepository {
    constructor(mongooseModel: PaginateModel<Document<Interview>>) {
        super(mongooseModel)
    }
    public async findInterviewByCondition(condition, skip:number, limit: number, sortBy: {}): Promise<Interview[]>{
        const result = await this._mongooseModel.find(condition).skip(skip).limit(limit).sort(sortBy);
        let listInterview:Interview[] = [] 
        result.map(d => listInterview.push(d.toObject<Interview>()))
        return listInterview
     }
}
