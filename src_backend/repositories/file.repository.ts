import { injectable } from "inversify";
import { Document, Model, PaginateModel } from "mongoose";
import { File } from "../entities/file";
import { BaseRepository,IBaseRepository } from "./base.repository";

export interface IFileRepository extends IBaseRepository<File>{
}


@injectable()
export class FileRepository extends BaseRepository<File> implements IFileRepository{
    constructor(mongooseModel: PaginateModel<Document<File>>){
        super(mongooseModel)
    }
}
