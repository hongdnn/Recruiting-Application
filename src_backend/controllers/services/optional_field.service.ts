import { inject, injectable } from "inversify";
import { IOptionalFieldRepository } from "../../repositories/optional_field.repository";
import { IPostRepository } from "../../repositories/post.repository";
import { TYPES } from "../../types";

export interface IOptionalFieldService{
    getOptionalFieldsByPostId(postId: string): Promise<{optional_fields: any[], message:string, status: number }>
}
    

@injectable()
export class OptionalFieldService implements IOptionalFieldService {
    @inject(TYPES.IOptionalFieldRepository) private readonly _optionalFieldRepo: IOptionalFieldRepository
    @inject(TYPES.IPostRepository) private readonly _postRepo: IPostRepository

    public async getOptionalFieldsByPostId(postId: string): Promise<{optional_fields: any[], message:string, status: number }>{
        const post = await this._postRepo.getById(postId)
        if(post !== null){
            let optionalFields = [];
            for(let optionFieldId of post.optional_field_ids){
                const optionalField = await this._optionalFieldRepo.getById(optionFieldId)
                if(optionalField !== null){
                    optionalFields.push(optionalField)
                }
            }
            return {optional_fields: optionalFields, message: 'Success', status: 0}
        }
        return {optional_fields: [], message: 'The post is not exsited.', status: 1}
    }
   
} 