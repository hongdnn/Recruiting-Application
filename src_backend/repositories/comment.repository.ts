import { injectable } from 'inversify'
import { Model, Document, PaginateModel } from 'mongoose';
import { BaseRepository, IBaseRepository } from './base.repository';
import { Comment } from '../entities/comment';

export interface ICommentRepository extends IBaseRepository<Comment> {
    getCommentByPostId(postId: string): Promise<Comment[]>
}

@injectable()
export class CommentRepository extends BaseRepository<Comment> implements ICommentRepository {
    constructor(mongooseModel: PaginateModel<Document<Comment>>) {
        super(mongooseModel)
    }

    public async getCommentByPostId(postId: string): Promise<Comment[]>{
        const comments = await this._mongooseModel.find({post_id: postId, is_disable: false}).sort({time: 1})
        let listComment:Comment[] = [] 
        comments.map(d => listComment.push(d.toObject<Comment>()))
        return listComment
    }

}
