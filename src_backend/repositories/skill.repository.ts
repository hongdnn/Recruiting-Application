import { injectable } from "inversify";
import { Document, Model, PaginateModel } from "mongoose";
import { Skill } from "../entities/skill";
import { BaseRepository,IBaseRepository } from "./base.repository";
export interface ISkillRepository extends IBaseRepository<Skill>{
    getIdSkillByLikeName(name: string): Promise<string[]>

}
@injectable()
export class SkillRepository extends BaseRepository<Skill> implements ISkillRepository{
    constructor(mongooseModel: PaginateModel<Document<Skill>>){
        super(mongooseModel)
    }

    public async getIdSkillByLikeName(name: string): Promise<string[]>{
        let listResult:string[] = []
        const results = await this._mongooseModel.find({ name: { $regex: name, $options: 'i' }},{_id: 1})
        results.map(d =>listResult.push(''+d.toObject<Skill>()._id))        
        return listResult
    }
}
