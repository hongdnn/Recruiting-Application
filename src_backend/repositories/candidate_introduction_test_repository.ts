import { injectable } from 'inversify'
import { Model, Document, PaginateModel } from 'mongoose';
import { BaseRepository, IBaseRepository } from './base.repository';
import { CandidateIntroductionTest } from '../entities/candidate_introduction_test';

export interface ICandidateIntroductionTestRepository extends IBaseRepository<CandidateIntroductionTest> {
    getReports(condition, sortBy: {}): Promise<CandidateIntroductionTest[] | []>
}

@injectable()
export class CandidateIntroductionTestRepository extends BaseRepository<CandidateIntroductionTest> implements ICandidateIntroductionTestRepository {
    constructor(mongooseModel: PaginateModel<Document<CandidateIntroductionTest>>) {
        super(mongooseModel)
    }

    public async getReports(condition, sortBy: {}): Promise<CandidateIntroductionTest[] | []>{
        const result = await this._mongooseModel.find(condition).sort(sortBy);
        if(result.length === 0){
           return []
        }
        let listCandidateIntroductionTest:CandidateIntroductionTest[] = [] 
        result.map(d => listCandidateIntroductionTest.push(d.toObject<CandidateIntroductionTest>()))
        return listCandidateIntroductionTest
    }
}
