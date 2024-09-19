import { injectable, inject } from 'inversify'
import { Model, Document, PaginateModel } from 'mongoose';
import { BaseRepository, IBaseRepository } from './base.repository';
import { Staff, User } from "../entities/user"

export interface IUserRepository  extends IBaseRepository<User> {
    getUserByEmail(email: string): Promise<User | null>
    searchStaff(condition, sort: {}): Promise<User[]>
}

@injectable()
export class UserRepository extends BaseRepository<User> implements IUserRepository {
    constructor(mongooseModel: PaginateModel<Document<User>>) {
        super(mongooseModel)
      }
      
    public async getUserByEmail(email: string): Promise<User | null>{
        const user = await this._mongooseModel.findOne({ email }, {_id: 1, email: 1, password: 1, first_name: 1, last_name: 1, status: 1, type_account: 1, verification_code: 1, permission_ids: 1, image_id: 1 })// tra ve null neu ko tim thay             
        if (user !== null) {
            return user.toObject<User>()
        }
        return null
    }

    public async searchStaff(condition, sort: {}): Promise<User[]>{
        const result = await this._mongooseModel.find(condition).sort(sort);
         let listStaff:User[] = [] 
         result.map(d => listStaff.push(d.toObject<User>()))
         return listStaff
    }
}
