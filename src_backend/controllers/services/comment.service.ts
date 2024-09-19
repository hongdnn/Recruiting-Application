import { inject, injectable } from "inversify";
import { CollaboratorStatus } from "../../common/constants";
import { Comment } from "../../entities/comment";
import { Token } from "../../JwtToken/JwtToken";
import { ICommentRepository } from "../../repositories/comment.repository";
import { IFileRepository } from "../../repositories/file.repository";
import { IPostRepository } from "../../repositories/post.repository";
import { IUserRepository } from "../../repositories/user.repository";
import { TYPES } from "../../types";

export interface ICommentService{
   createComment(bearerToken: string, comment: Comment):  Promise<{data: {}, status: number, message: string}>
   getComments(postId: string): Promise<{data: {}, message: string, status: number}>
   replyComment(bearerToken: string, comment: Comment): Promise<{data: {}, status: number, message: string}>
   getCommentsLikedByUser(bearerToken: string,  postId: string): Promise<{comments: {}, messsage: string, status: number}>
   likeComment(bearerToken: string,  commentId: string): Promise<{message: string, status: number}>
}
    

@injectable()
export class CommentService implements ICommentService {
    @inject(TYPES.ICommentRepository) private readonly _commentRepo: ICommentRepository
    @inject(TYPES.IUserRepository) private readonly _userRepo: IUserRepository
    @inject(TYPES.IPostRepository) private readonly _postRepo: IPostRepository
    @inject(TYPES.IFileRepository) private readonly _fileRepo: IFileRepository
    @inject(TYPES.Token) private readonly _token: Token

    public async getCommentsLikedByUser(bearerToken: string, postId: string): Promise<{comments: {}, messsage: string, status: number}>{
        const userData = this._token.getUserInfo(bearerToken)
        const post = await this._postRepo.getById(postId)
        let commentLiked = []
        if(post !== null){
            const comments = await this._commentRepo.getCommentByPostId(postId)
            for(let comment of comments){
                if(comment.like_action.includes(userData.id)){
                    commentLiked.push(''+comment._id)
                }
            }
            return {comments: commentLiked, messsage: 'Success', status:0}
        }   
        return {comments: {}, messsage: 'The post is not found', status : 1}
    }


    public async getComments(postId: string): Promise<{data: {}, message: string, status: number}>{
        const post = await this._postRepo.getById(postId)
        if(post !== null){
            const comments: Comment[] = await this._commentRepo.getCommentByPostId(postId) // lay het cmt co ca reply
                       
            let listComment = []           
            for (let index = 0; index < comments.length; index++) {
                const element = comments[index] // duyet tung cmt
                const user = await this._userRepo.getById(element.user_id) // lay user dag cmt cai cmt do 
                const imageFile = await this._fileRepo.getById(user.image_id)
                let linkImage = ''
                if(imageFile !== null){
                    linkImage = '/static/images/'+imageFile.name
                }
                const comment= {
                    id: element._id,
                    content: element.content,
                    account_name: user.first_name + ' ' + user.last_name,
                    time: element.time,
                    image: linkImage,
                    number_of_like: element.like_action.length,
                    childs: []
                }
                if(element.parent_comment_id !== null){ // nghĩa là comment này là comment con
                    delete comment.childs
                    const c = listComment.find(com => ''+com.id === element.parent_comment_id) 
                    c.childs.unshift(comment)            
                }else{
                    listComment.push(comment)
                }
            }
            listComment = listComment.sort((c1,c2)=>c2.time - c1.time)
            const result ={
                data: {
                    comments:listComment
                },
                message: 'Success',
                status: 0
            }
            return result
        }
        return {data: {}, message: 'The post is not exsited.', status: 1}
    }

    public async createComment(bearerToken: string, comment: Comment): Promise<{data: {}, message: string, status: number}>{
        const tokenData = this._token.getUserInfo(bearerToken);
        if(tokenData.type_account === 'employer'){
            if(!tokenData.permission.includes('post.all') && !tokenData.permission.includes('post.comment')){
                return {data: {}, message: "Permission is required", status: 4 }
            }
        }
        const post = await this._postRepo.getById(comment.post_id);
        if(post !== null){
            if(post.status !== 'close'){
                const user = await this._userRepo.getById(tokenData.id);
                if(user.status === CollaboratorStatus.APPROVAL){
                    comment.user_id = user._id;
                    comment.is_disable = false;
                    comment.time = new Date().getTime();
                    await this._commentRepo.create(comment);
                    const comments: Comment[] = await this._commentRepo.getCommentByPostId(comment.post_id) 
                    let listComment = []           
                    for (let index = 0; index < comments.length; index++) {
                        const element = comments[index]
                        const user = await this._userRepo.getById(element.user_id)  
                        const imageFile = await this._fileRepo.getById(user.image_id)
                        let linkImage = ''
                        if(imageFile !== null){
                            linkImage = imageFile.path
                        }              
                        const comment= {
                            id: element._id,
                            content: element.content,
                            account_name: user.first_name + ' ' + user.last_name,
                            time: element.time,
                            image: linkImage,
                            number_of_like: element.like_action.length,
                            childs: []
                        }
                        if(element.parent_comment_id !== null){
                            delete comment.childs
                            const c = listComment.find(com => ''+com.id === element.parent_comment_id) 
                            c.childs.unshift(comment)
                        }else{
                            listComment.push(comment)
                        }
                    }
                    listComment = listComment.sort((c1,c2)=>c2.time - c1.time)
                    const result ={
                        data: {
                            comments:listComment
                        },
                        message: 'Success',
                        status: 0
                    }
                    return result
                }
                return {data: {}, status: 1, message: 'The account is not approval'}
            }
            return {data: {}, status: 2, message: 'The post is close.'}
        }
        return {data: {}, status: 3, message: 'The post is not exsited.'}
    }

    public async replyComment(bearerToken: string, comment: Comment): Promise<{data: {}, status: number, message: string}>{
        const tokenData = this._token.getUserInfo(bearerToken);
        if(tokenData.type_account === 'employer'){
            if(!tokenData.permission.includes('post.all') && !tokenData.permission.includes('post.comment')){
                return {data: {}, message: "Permission is required", status: 2 }
            }
        }
        const parentComment = await this._commentRepo.getById(comment.parent_comment_id)
        if(parentComment !== null ){
            const user = await this._userRepo.getById(tokenData.id);
            if(user.status === 'approval'){
                comment.time = new Date().getTime();
                comment.is_disable = false
                comment.post_id = parentComment.post_id
                comment.user_id = tokenData.id
                await this._commentRepo.create(comment);
                const comments: Comment[] = await this._commentRepo.getCommentByPostId(comment.post_id) 
                let listComment = []           
                for (let index = 0; index < comments.length; index++) {
                    const element = comments[index]
                    const user = await this._userRepo.getById(element.user_id)
                    const imageFile = await this._fileRepo.getById(user.image_id)
                    let linkImage = ''
                    if(imageFile !== null){
                        linkImage = imageFile.path
                    }
                    const comment= {
                        id: element._id,
                        content: element.content,
                        account_name: user.first_name + ' ' + user.last_name,
                        time: element.time,
                        image: linkImage,
                        number_of_like: element.like_action.length,
                        childs: []
                    }

                    if(element.parent_comment_id !== null){
                        //sort theo thời gian từ thấy đến cao thì chắc chắn sẽ có comment parent trước nên listComment ko thể rỗng khi vô tới đây  
                        delete comment.childs
                        const c = listComment.find(com => ''+com.id === element.parent_comment_id) 
                        c.childs.unshift(comment)
                    }else{
                        listComment.push(comment)
                    }
                }
                listComment = listComment.sort((c1,c2)=>c2.time - c1.time)
                const result ={
                    data: {
                        comments:listComment
                    },
                    message: 'Success',
                    status: 0
                }
                return result
            }
            return {data: {}, status: 1, message: 'The account is not approval.'}
        }
        return {data: {}, status: 3, message: 'The parent comment is not exsited.'}
    }

    public async likeComment(bearerToken: string, commentId: string): Promise<{message: string, status: number}>{
        const userData = this._token.getUserInfo(bearerToken);
        const user = await this._userRepo.getById(userData.id);
        if(user !== null){ // check user tồn tại hay không
            const cm = await this._commentRepo.getById(commentId)
            if(cm !== null){
                if(!cm.is_disable){
                    if(cm.like_action.includes(''+user._id)){ // nếu User đã like
                        const updatedComment =  await this._commentRepo.update(cm._id,{"$pull": {like_action: ''+user._id}})
                        return {message: 'Unlike comment success', status: 0}
                        
                     }else{
                         const updatedComment = await this._commentRepo.update(cm._id,{'$push': {like_action: ''+user._id}})
                         return {message: 'Like comment success', status: 0}
                     }                        
                }
                return {status: 1, message: 'The comment is disable.'}
            }   
            return {status: 2, message: 'The comment is not found.'}
            
        }
        return {status: 2, message: 'The account is not exsited.'}
           
       
    }


    
   
} 