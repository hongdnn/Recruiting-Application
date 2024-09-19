import { injectable } from "inversify";
import { Document, Model, PaginateModel } from "mongoose";
import { Placement } from "../entities/placement";
import { BaseRepository,IBaseRepository } from "./base.repository";
export interface IPlacementRepository extends IBaseRepository<Placement>{

}
@injectable()
export class PlacementRepository extends BaseRepository<Placement> implements IPlacementRepository{
    constructor(mongooseModel: PaginateModel<Document<Placement>>){
        super(mongooseModel)
    }
}
