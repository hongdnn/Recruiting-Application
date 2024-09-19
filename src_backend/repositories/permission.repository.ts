import { injectable } from 'inversify'
import { Model, Document, PaginateModel } from 'mongoose';
import { BaseRepository, IBaseRepository } from './base.repository';
import { WorkExperience } from '../entities/work_experience';
import { Permission } from '../entities/permission';

export interface IPermissionRepository extends IBaseRepository<Permission> {
}

@injectable()
export class PermissionRepository extends BaseRepository<Permission> implements IPermissionRepository {
    constructor(mongooseModel: PaginateModel<Document<Permission>>) {
        super(mongooseModel)
    }   

}
