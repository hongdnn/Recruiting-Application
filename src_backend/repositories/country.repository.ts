import { injectable } from 'inversify'
import { Model, Document, PaginateModel } from 'mongoose';
import { BaseRepository, IBaseRepository } from './base.repository';
import { Country } from '../entities/country';

export interface ICountryRepository extends IBaseRepository<Country> {

}

@injectable()
export class CountryRepository extends BaseRepository<Country> implements ICountryRepository {
    constructor(mongooseModel: PaginateModel<Document<Country>>) {
        super(mongooseModel)
    }

}
