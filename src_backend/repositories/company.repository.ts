import { injectable } from 'inversify'
import { Model, Document, PaginateModel } from 'mongoose';
import { BaseRepository, IBaseRepository } from './base.repository';
import { Company } from '../entities/company';

export interface ICompanyRepository extends IBaseRepository<Company> {
    getCompanyByLikeName(name: string): Promise<Company[]>
}

@injectable()
export class CompanyRepository extends BaseRepository<Company> implements ICompanyRepository {
    constructor(mongooseModel: PaginateModel<Document<Company>>) {
        super(mongooseModel)
    }

    public async getCompanyByLikeName(name: string): Promise<Company[]>{
        let listResult: Company[] = []
        const results = await this._mongooseModel.find({ company: { $regex: name, $options: 'i' }},{_id: 1,image_file_id: 1, company: 1 })
        results.map(d =>listResult.push(d.toObject<Company>()))
        return listResult
    }

}
