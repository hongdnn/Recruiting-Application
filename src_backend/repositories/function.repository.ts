import { injectable } from 'inversify'
import { Model, Document, PaginateModel } from 'mongoose';
import { BaseRepository, IBaseRepository } from './base.repository';
import { Function, FunctionReturnDto } from '../entities/function';

export interface IFunctionRepository extends IBaseRepository<Function> {
    getFunctionsByIndustry(industryId: string): Promise<FunctionReturnDto[]>
}

@injectable()
export class FunctionRepository extends BaseRepository<Function> implements IFunctionRepository {
    constructor(mongooseModel: PaginateModel<Document<Function>>) {
        super(mongooseModel)
    }

    public async getFunctionsByIndustry(industryId: string): Promise<FunctionReturnDto[]> {
        const functions = await this._mongooseModel.find({industry_id: industryId})
        let listFunction: Function[] = []
        functions.map(e => listFunction.push(e.toObject<Function>()))
        let result: FunctionReturnDto[] = []
        for(let functionRecord of listFunction){
            if(functionRecord.status === 'publish'){
                let tmp: FunctionReturnDto = {
                    id: functionRecord._id,
                    name: functionRecord.name,
                    translate: functionRecord.translate
                }
                result.push(tmp)
            }
        }
        return result
    }
}
