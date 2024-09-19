import { injectable, inject } from 'inversify'
import { Model, Document, PaginateModel } from 'mongoose';
import { BaseRepository, IBaseRepository } from './base.repository';
import { Post } from '../entities/post';

export interface IPostRepository  extends IBaseRepository<Post> {
   //findPostByCondition(condition,offset: number,limit: number, sortBy: {}):Promise<{data: Post[], infoPaging: any}>
   findPostIdByCondition(condition):Promise<string[]>
   getPostCountByCondition(condition):Promise<number>
}

@injectable()
export class PostRepository extends BaseRepository<Post> implements IPostRepository {
    constructor(mongooseModel: PaginateModel<Document<Post>>) {
        super(mongooseModel)
      }
      // public async findPostByCondition(condition,offset: number,limit: number, sortBy: {}): Promise<{data: Post[], infoPaging: any}>{
      //    const result = await this._mongooseModel.paginate(condition,{ offset, limit, sort: sortBy })
      //    const docs = result.docs
      //    //const result = await this._mongooseModel.find(condition).sort(sortBy);
      //    let listPost:Post[] = [] 
      //    docs.map(d => listPost.push(d.toObject<Post>()))
      //    delete result.docs
      //    console.log(result)
      //    return {data: listPost, infoPaging: result}
      // }  

      public async findPostIdByCondition(condition):Promise<string[]> {
         const result = await this._mongooseModel.find(condition,{_id: 1})
         let listPostId: string[] = [] 
         result.map(d => listPostId.push(''+d.toObject<Post>()._id))
         return listPostId
      }

      public async getPostCountByCondition(condition):Promise<number>{
         const result = await this._mongooseModel.countDocuments(condition)
         return result
      }
}
