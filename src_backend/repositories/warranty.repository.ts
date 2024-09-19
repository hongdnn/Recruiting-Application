import { injectable } from "inversify";
import { Document, Model, PaginateModel } from "mongoose";
import { Warranty } from "../entities/warranty";
import { BaseRepository,IBaseRepository } from "./base.repository";
export interface IWarrantyRepository extends IBaseRepository<Warranty>{

}
@injectable()
export class WarrantyRepository extends BaseRepository<Warranty> implements IWarrantyRepository{
    constructor(mongooseModel: PaginateModel<Document<Warranty>>){
        super(mongooseModel)
    }
}
