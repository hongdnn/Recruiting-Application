import { injectable, inject } from 'inversify'
import { Model, Document, PaginateModel } from 'mongoose';
import { BaseRepository, IBaseRepository } from './base.repository';
import { SavePost } from '../entities/save_post';

export interface ISavedPostRepository extends IBaseRepository<SavePost> {
    checkSavedPostOfUser(condition): Promise<{saved: boolean, savePostId: string}>
    getSavePostsbyUserId(user_id: string): Promise<SavePost[]>
}

@injectable()
export class SavedPostRepository extends BaseRepository<SavePost> implements ISavedPostRepository {
    constructor(mongooseModel: PaginateModel<Document<SavePost>>) {
        super(mongooseModel)
    }
    public async checkSavedPostOfUser(condition): Promise<{saved: boolean, savePostId: string}> {
        const result = await this._mongooseModel.findOne(condition)
        if (result !== null) {
            return {saved: true, savePostId: result.toObject<SavePost>()._id.toString()}
        }
        return {saved: false, savePostId: null}
    }

    public async getSavePostsbyUserId(user_id: string): Promise<SavePost[]> {
        const result = await this._mongooseModel.find({ user_id: user_id })
        let listSavePosts: SavePost[] = []
        result.map(d => listSavePosts.push(d.toObject<SavePost>()))
        return listSavePosts
    }
}
