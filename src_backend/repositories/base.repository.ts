import { injectable, inject } from 'inversify'
import {PaginateModel, Document} from 'mongoose';

export interface IBaseRepository<T> {
    create(entity: T): Promise<T | null>;
    update(id: string, updateFields: {}): Promise<T | null>;
    getAll(): Promise<T[]>;
    getById(id: string): Promise<T | null>
    delete(id: string): Promise<boolean>
    findByCondition(condition) :Promise<T[]>
    getListIdByCondition(condition): Promise<string[]>
    findByConditionAndPaging(condition, offset: number, limit: number, sort: {}): Promise<{data: T[], infoPaging: any}>
}

@injectable()
export abstract class BaseRepository<T> implements IBaseRepository<T> {
    //@inject(TYPES.UserModel) private userModel: { create: (arg0: any) => any }
    // protected _mongooseModel: Model<Document<T>>
    // constructor(mongooseModel: Model<Document<T>>) {
    //     this._mongooseModel = mongooseModel
    // }
    protected _mongooseModel: PaginateModel<Document<T>>
    constructor(mongooseModel: PaginateModel<Document<T>>) {
        this._mongooseModel = mongooseModel
    }

    public async create(entity: T): Promise<T | null> {// done
        const result = await this._mongooseModel.create(entity)// neu loi throw ra loi 500 
        return result.toObject<T>();
    }
    public async update(id: string, updateFields: {}): Promise<T | null> {
        const result = await this._mongooseModel.findByIdAndUpdate({ _id: id }, updateFields, { new: true })// neu ko tim thay tra null, neu ko dung dinh dang object id thi throw 500
        if (result !== null) {
            return result.toObject<T>()
        }
        return null
    }
       

    public async getAll(): Promise<T[]>{
        const result = await this._mongooseModel.find()
        const list: T[] = [];
        result.map(e => list.push(e.toObject<T>()))
        return list;
    }

    public async delete(id: string): Promise<boolean>{
        const result =  await this._mongooseModel.findByIdAndRemove({_id: id}) // find thi xai id
        if(result !== null){
            return true
        }
        return false;       
    }
    public async getById(id: string): Promise<T | null> {
        const result = await this._mongooseModel.findById(id)
        if (result !== null) {
            return result.toObject<T>();
        }
        return null
    }

    public async findByCondition(condition): Promise<T[]>{
        const result = await this._mongooseModel.find(condition)
        let listT:T[] = [] 
        result.map(d => listT.push(d.toObject<T>()))
        return listT
    }

    public async findByConditionAndPaging(condition, offset: number, limit: number, sort: {}): Promise<{data: T[], infoPaging: any}>{
        const result = await this._mongooseModel.paginate(condition,{ offset, limit, sort: sort })
        const docs = result.docs
        let listPost:T[] = [] 
        docs.map(d => listPost.push(d.toObject<T>()))
        delete result.docs
        return {data: listPost, infoPaging: result}
    }
    
    public async getListIdByCondition(condition): Promise<string[]>{
        const result = await this._mongooseModel.find(condition, {_id: 1})
        let listId: string[] = [] 
        result.map(d => listId.push(d.id))
        return listId
    }
}
