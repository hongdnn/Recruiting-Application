import { injectable } from "inversify";
import { Document, Model, PaginateModel } from "mongoose";
import { JobRole } from "../entities/job_role";
import { BaseRepository,IBaseRepository } from "./base.repository";

export interface IJobRoleRepository extends IBaseRepository<JobRole>{
    getIdJobRoleByLikeName(name: string): Promise<string[]>

}

@injectable()
export class JobRoleRepository extends BaseRepository<JobRole> implements IJobRoleRepository{

    constructor(mongooseModel: PaginateModel<Document<JobRole>>){
        super(mongooseModel)
    }

    public async getIdJobRoleByLikeName(name: string): Promise<string[]>{
        let listResult: string[] = [];
        const results = await this._mongooseModel.find({ name: { $regex: name, $options: 'i' },status: 'publish' },{_id: 1})
        results.map(d =>listResult.push(''+d.toObject<JobRole>()._id))
        return listResult
    }
}