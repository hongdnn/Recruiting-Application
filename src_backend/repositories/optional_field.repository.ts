import { injectable } from "inversify";
import { Document, Model, PaginateModel } from "mongoose";
import { OptionalField } from "../entities/optional_field";
import { BaseRepository,IBaseRepository } from "./base.repository";

export interface IOptionalFieldRepository extends IBaseRepository<OptionalField>{
}


@injectable()
export class OptionalFieldRepository extends BaseRepository<OptionalField> implements IOptionalFieldRepository{
    constructor(mongooseModel: PaginateModel<Document<OptionalField>>){
        super(mongooseModel)
    }
}
