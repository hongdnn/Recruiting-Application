import { injectable } from "inversify";
import { Document, Model, PaginateModel } from "mongoose";
import { Industry } from "../entities/industry";
import { BaseRepository,IBaseRepository } from "./base.repository";

export interface IIndustryRepository extends IBaseRepository<Industry>{
    getIdIndustryByLikeName(name: string): Promise<string[]>

}

@injectable()
export class IndustryRepository extends BaseRepository<Industry> implements IIndustryRepository{
    constructor(mongooseModel: PaginateModel<Document<Industry>>){
        super(mongooseModel)
    }

    public async getIdIndustryByLikeName(name: string): Promise<string[]>{
        let listResult: string[] = []
        const results = await this._mongooseModel.find({ name: { $regex: name, $options: 'i' },status: 'publish' },{_id: 1})
        results.map(d =>listResult.push(''+d.toObject<Industry>()._id))
        return listResult
    }
}