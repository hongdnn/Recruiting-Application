import { injectable } from 'inversify'
import { Model, Document, PaginateModel } from 'mongoose';
import { BaseRepository, IBaseRepository } from './base.repository';
import { CandidateSkill } from '../entities/candidate_skill';

export interface ICandidateSkillRepository extends IBaseRepository<CandidateSkill> {
}

@injectable()
export class CandidateSkillRepository extends BaseRepository<CandidateSkill> implements ICandidateSkillRepository {
    constructor(mongooseModel: PaginateModel<Document<CandidateSkill>>) {
        super(mongooseModel)
    }   

}
