import { injectable } from 'inversify'
import { Model, Document, PaginateModel } from 'mongoose';
import { BaseRepository, IBaseRepository } from './base.repository';
import { CandidateIntroduction } from '../entities/candidate_introduction';

export interface ICandidateIntroductionRepository extends IBaseRepository<CandidateIntroduction> {
    findCandidateIntroductionByCondition(condition, sortBy: {}): Promise<CandidateIntroduction[]>
    getIntroductionCountByCondition(condition): Promise<number>
    findCanddidateIdInIntroductionByCondition(condition): Promise<string[]>
}

@injectable()
export class CandidateIntroductionRepository extends BaseRepository<CandidateIntroduction> implements ICandidateIntroductionRepository {
    constructor(mongooseModel: PaginateModel<Document<CandidateIntroduction>>) {
        super(mongooseModel)
    }

    public async findCandidateIntroductionByCondition(condition, sortBy: {}): Promise<CandidateIntroduction[]> {
        const result = await this._mongooseModel.find(condition).sort(sortBy);
        let listCandidateIntroduction: CandidateIntroduction[] = []
        result.map(d => listCandidateIntroduction.push(d.toObject<CandidateIntroduction>()))
        return listCandidateIntroduction
    }  
    public async findCanddidateIdInIntroductionByCondition(condition): Promise<string[]>{
        const result = await this._mongooseModel.find(condition);
        let listCandidateIntroductionId:string[] = [] 
        result.map(d => listCandidateIntroductionId.push(d.toObject<CandidateIntroduction>().candidate_id))
        return listCandidateIntroductionId
    }

    public async getIntroductionCountByCondition(condition): Promise<number> {
        const result = await this._mongooseModel.countDocuments(condition)
        return result
    }
}
