import { injectable } from 'inversify'
import { Model, Document, PaginateModel } from 'mongoose';
import { BaseRepository, IBaseRepository } from './base.repository';
import { WorkExperience } from '../entities/work_experience';

export interface ICandidateWorkExperienceRepository extends IBaseRepository<WorkExperience> {
}

@injectable()
export class CandidateWorkExperienceRepository extends BaseRepository<WorkExperience> implements ICandidateWorkExperienceRepository {
    constructor(mongooseModel: PaginateModel<Document<WorkExperience>>) {
        super(mongooseModel)
    }   

}
