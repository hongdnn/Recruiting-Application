import { injectable } from 'inversify'
import {PaginateModel, Document} from 'mongoose';
import { BaseRepository, IBaseRepository } from './base.repository';
import { CandidateIntroductionStatusHistory } from '../entities/candidate_introduction_status_history';

export interface ICandidateIntroductionStatusHistoryRepository extends IBaseRepository<CandidateIntroductionStatusHistory> {
    findStatusHistoryByCondition(condition): Promise<CandidateIntroductionStatusHistory[] | []>
    getStatusHistories(condition, sortBy: {}): Promise<CandidateIntroductionStatusHistory[] | []>
    getNewestStatus(candidateIntroductionId: string): Promise<CandidateIntroductionStatusHistory | null>
}

@injectable()
export class CandidateIntroductionStatusHistoryRepository extends BaseRepository<CandidateIntroductionStatusHistory> implements ICandidateIntroductionStatusHistoryRepository {
    constructor(mongooseModel: PaginateModel<Document<CandidateIntroductionStatusHistory>>) {
        super(mongooseModel)
    }

    public async findStatusHistoryByCondition(condition): Promise<CandidateIntroductionStatusHistory[] | []>{
        const result = await this._mongooseModel.find(condition);
        if(result.length === 0){
           return []
        }
        let listCandidateIntroduction:CandidateIntroductionStatusHistory[] = [] 
        result.map(d => listCandidateIntroduction.push(d.toObject<CandidateIntroductionStatusHistory>()))
        return listCandidateIntroduction
    }  

    public async getStatusHistories(condition, sortBy: {}): Promise<CandidateIntroductionStatusHistory[] | []>{
        const result = await this._mongooseModel.find(condition).sort(sortBy);
        if(result.length === 0){
           return []
        }
        let listCandidateIntroduction:CandidateIntroductionStatusHistory[] = [] 
        result.map(d => listCandidateIntroduction.push(d.toObject<CandidateIntroductionStatusHistory>()))
        return listCandidateIntroduction
    }

    public async getNewestStatus(candidateIntroductionId: string):Promise<CandidateIntroductionStatusHistory| null>{
        const result = await this._mongooseModel.find({candidate_introduction_id: candidateIntroductionId}).sort({_id: -1}).limit(1)
        if(result.length === 0){
            return null
        }
        return result[0].toObject<CandidateIntroductionStatusHistory>()
    }
}
