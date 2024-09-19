import { injectable } from "inversify";
import { Document, Model, PaginateModel } from "mongoose";
import { OptionalField } from "../entities/optional_field";
import { OptionalFieldsValue } from "../entities/optional_fields_value";
import { BaseRepository,IBaseRepository } from "./base.repository";

export interface IOptionalFieldValueRepository extends IBaseRepository<OptionalFieldsValue>{
    findByCandidateIntroduce(introduceId: string): Promise<OptionalFieldsValue[]>
}


@injectable()
export class OptionalFieldValueRepository extends BaseRepository<OptionalFieldsValue> implements IOptionalFieldValueRepository{
    constructor(mongooseModel: PaginateModel<Document<OptionalFieldsValue>>){
        super(mongooseModel)
    }

    public async findByCandidateIntroduce(introduceId: string): Promise<OptionalFieldsValue[]>{
        let listResult: OptionalFieldsValue[] = []
        const results = await this._mongooseModel.find({ candidate_introduction_id: introduceId })
        results.map(d =>listResult.push(d.toObject<OptionalFieldsValue>()))
        return listResult
    }
}
