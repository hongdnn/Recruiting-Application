import { injectable } from 'inversify'
import {Document, PaginateModel} from 'mongoose';
import { BaseRepository, IBaseRepository } from './base.repository';
import { Candidate } from '../entities/candidate';

export interface ICandidateRepository extends IBaseRepository<Candidate> {
    findCandidateByCondition(condition,sortBy: {}): Promise<Candidate[]>
    checkCandidateHadIntroduction(candidateId: string): Promise<boolean>
}

@injectable()
export class CandidateRepository extends BaseRepository<Candidate> implements ICandidateRepository {
    constructor(mongooseModel: PaginateModel<Document<Candidate>>) {
        super(mongooseModel)
    }

    public async findCandidateByCondition(condition, sortBy: {}): Promise<Candidate[]>{
        const result = await this._mongooseModel.find(condition).sort(sortBy);
        let listCandidate:Candidate[] = [] 
        result.map(d => listCandidate.push(d.toObject<Candidate>()))
        return listCandidate
    }  
    public async checkCandidateHadIntroduction(candidateId: string): Promise<boolean>{
        const result = await this._mongooseModel.findOne({candidate_id: candidateId})
        if(result !== null){
            return true
        }
        return false
    }

}
