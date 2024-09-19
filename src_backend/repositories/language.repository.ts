import { injectable } from "inversify";
import { Document, Model, PaginateModel } from "mongoose";
import { Language } from "../entities/language";
import { BaseRepository,IBaseRepository } from "./base.repository";

export interface ILanguageRepository extends IBaseRepository<Language>{
    getIdLanguageByLikeDescription(description: string): Promise<string[]>
}


@injectable()
export class LanguageRepository extends BaseRepository<Language> implements ILanguageRepository{
    constructor(mongooseModel: PaginateModel<Document<Language>>){
        super(mongooseModel)
    }

    public async getIdLanguageByLikeDescription(description: string): Promise<string[]>{
        let listResult:string[] = []
        const results = await this._mongooseModel.find({ name: { $regex: description, $options: 'i' },is_disable: false },{_id: 1})
        results.map(d =>listResult.push(''+d.toObject<Language>()._id))  
        return listResult
    }
}
