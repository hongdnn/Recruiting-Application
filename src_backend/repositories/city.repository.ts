import { injectable } from 'inversify'
import { Model, Document, PaginateModel } from 'mongoose';
import { BaseRepository, IBaseRepository } from './base.repository';
import { City } from '../entities/city';

export interface ICityRepository extends IBaseRepository<City> {
}

@injectable()
export class CityRepository extends BaseRepository<City> implements ICityRepository {
    constructor(mongooseModel: PaginateModel<Document<City>>) {
        super(mongooseModel)
    }   

}
