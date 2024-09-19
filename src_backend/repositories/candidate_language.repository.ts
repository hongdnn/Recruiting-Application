import { injectable } from 'inversify'
import { Model, Document, PaginateModel } from 'mongoose';
import { BaseRepository, IBaseRepository } from './base.repository';
import { CandidateLanguage } from '../entities/candidate_language';

export interface ICandidateLanguageRepository extends IBaseRepository<CandidateLanguage> {
}

@injectable()
export class CandidateLanguageRepository extends BaseRepository<CandidateLanguage> implements ICandidateLanguageRepository {
    constructor(mongooseModel: PaginateModel<Document<CandidateLanguage>>) {
        super(mongooseModel)
    }   

}
