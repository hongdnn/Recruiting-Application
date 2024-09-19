import { inject, injectable } from "inversify";
import { SavePost } from "../../entities/save_post";
import { IPostRepository } from "../../repositories/post.repository";
import { ISavedPostRepository } from "../../repositories/saved_post.repository";
import { IUserRepository } from "../../repositories/user.repository";
import { TYPES } from "../../types";
import { Token } from "../../JwtToken/JwtToken";
import { ICompanyRepository } from "../../repositories/company.repository";
import { ICityRepository } from "../../repositories/city.repository";
import { ISkillRepository } from "../../repositories/skill.repository";
import { IJobRoleRepository } from "../../repositories/job_role.repository";
import { ILanguageRepository } from "../../repositories/language.repository";
import { IIndustryRepository } from "../../repositories/industry.repository";
import { IFileRepository } from "../../repositories/file.repository";
import {CollaboratorStatus} from '../../common/constants'
import { ObjectId } from "mongodb";

export interface ISavePostService {
    createSavedPost(bearerToken: string, savePost: SavePost): Promise<{ savedPost: {}, status: number, message: string }>
    unsavedPost(bearerToken: string, savedPostId: string): Promise<{ message: string, status: number }>
    getAll(): Promise<SavePost[]>
    getSavePosts(bearerToken: string, condition, pageIndex: number, pageSize: number, sortBy: number):
        Promise<{ pageIndex: number, pageSize: number, totalPages: number, totalCount: number, savePosts: any[] }>
}

@injectable()
export class SavePostService implements ISavePostService {
    @inject(TYPES.ISavedPostRepository) private readonly _savedPostRepo: ISavedPostRepository
    @inject(TYPES.IUserRepository) private readonly _userRepo: IUserRepository
    @inject(TYPES.IPostRepository) private readonly _postRepo: IPostRepository
    @inject(TYPES.ICompanyRepository) private readonly _companyRepo: ICompanyRepository
    @inject(TYPES.ICityRepository) private readonly _cityRepo: ICityRepository
    @inject(TYPES.ISkillRepository) private readonly _skillRepo: ISkillRepository
    @inject(TYPES.IJobRoleRepository) private readonly _jobRoleRepo: IJobRoleRepository
    @inject(TYPES.ILanguageRepository) private readonly _languageRepo: ILanguageRepository
    @inject(TYPES.IIndustryRepository) private readonly _industryRepo: IIndustryRepository
    @inject(TYPES.IFileRepository) private readonly _fileRepo: IFileRepository
    @inject(TYPES.Token) private readonly _token: Token

    public async createSavedPost(bearerToken: string, savePost: SavePost): Promise<{ savedPost: {}, status: number, message: string }> {
        let userInfo = this._token.getUserInfo(bearerToken)
        const checkUser = await this._userRepo.getById(userInfo.id);
        if (checkUser !== null) {// check xem user tồn tại không
            if (checkUser.status === CollaboratorStatus.APPROVAL) { // check xem trạng thái user
                savePost.user_id = userInfo.id
                const checkPost = await this._postRepo.getById(savePost.post_id)
                if (checkPost !== null) { // check xem post có tồn tại không
                    if (checkPost.status !== "close") { // check xem post có active, pause không
                        const resultCheckSavePost = await this._savedPostRepo.checkSavedPostOfUser({ user_id: checkUser._id, post_id: checkPost._id }) // check xem post đã lưu chưa
                        if (!resultCheckSavePost.saved) { // nếu post này chưa save
                            savePost.time_save = new Date().getTime();
                            const result = await this._savedPostRepo.create(savePost)
                            return { savedPost: result, status: 0, message: 'Success' }
                        }
                        return { savedPost: {}, status: 1, message: 'This post is already in the saved post list.' };
                    }
                    return { savedPost: {}, status: 2, message: 'This post is close.' };
                }
                return { savedPost: {}, status: 2, message: 'This post is not found.' };
            } else if (checkUser.status === CollaboratorStatus.LOCK) {
                return { savedPost: {}, status: 3, message: 'This user is lock' };
            }
            return { savedPost: {}, status: 3, message: 'This user is invailable' };
        }
        return { savedPost: {}, status: 3, message: 'This user is not exsited.' };
    }

    public async unsavedPost(bearerToken: string, savedPostId: string): Promise<{ message: string, status: number }> {
        let userInfo = this._token.getUserInfo(bearerToken)
        const user = await this._userRepo.getById(userInfo.id);
        if (user !== null) {
            const resultCheckSavePost = await this._savedPostRepo.checkSavedPostOfUser({ user_id: userInfo.id, _id: new ObjectId(savedPostId) })
            if (resultCheckSavePost.saved) {
                const result = await this._savedPostRepo.delete(savedPostId)
                if (result) {
                    return { message: 'Remove success', status: 0 }
                }
                return { message: 'This saved post is not existed to remove.', status: 1 }
            }
            return { message: 'This saved post and user is not match.', status: 2 }
        }
        return { message: 'This user is not exsited.', status: 1 }

    }
    public async getAll(): Promise<SavePost[]> {
        const savedPosts = await this._savedPostRepo.getAll()
        return savedPosts;
    }

    public async getSavePosts(bearerToken: string, condition, pageIndex: number, pageSize: number, sortBy: number):
        Promise<{ pageIndex: number, pageSize: number, totalPages: number, totalCount: number, savePosts: any[] }> {
        var listPosts = []
        const userInfo = this._token.getUserInfo(bearerToken)
        const listSavePosts = await this._savedPostRepo.getSavePostsbyUserId(userInfo.id)
        if (listSavePosts.length !== 0) {
            for (const savePost of listSavePosts) {
                const post = await this._postRepo.getById(savePost.post_id)
                if (post !== null) {
                    if (condition.keyword_type === '0') {
                        let checkKeyWord = 0
                        for (let skillId of post.skill_ids) {
                            const skill = await this._skillRepo.getById(skillId)
                            if (skill.name.includes(condition.keyword)) {
                                checkKeyWord++
                                break
                            }
                        }
                        if (post.title.includes(condition.keyword) || post.job_level.includes(condition.keyword) || post.benefit.includes(condition.keyword) ||
                            post.require.includes(condition.keyword) || post.notice_for_referrer.includes(condition.keyword) || post.content.includes(condition.keyword)) {    
                            checkKeyWord++
                        }
                        for (let langId of post.language_ids) {
                            const language = await this._languageRepo.getById(langId)
                            if (language.name.includes(condition.keyword)) {
                                checkKeyWord++
                                break
                            }
                        }
                        for (let jobRoleId of post.job_role_ids) {
                            const jobRole = await this._jobRoleRepo.getById(jobRoleId)
                            if (jobRole.name.includes(condition.keyword)) {
                                checkKeyWord++
                                break
                            }
                        }
                        const industry = await this._industryRepo.getById(post.industry_id)
                        if (industry.name.includes(condition.keyword)) {
                            checkKeyWord++
                        }
                        if (checkKeyWord === 0) {
                            continue
                        }
                        
                    } else if (condition.keyword_type === '1' && !post.title.includes(condition.keyword)){ 
                        continue
                    } else if (condition.keyword_type === '2' && !post.job_level.includes(condition.keyword)) {
                        continue
                    } else if (condition.keyword_type === '3') {
                        let checkKeyWord = 0
                        for (let jobRoleId of post.job_role_ids) {
                            const jobRole = await this._jobRoleRepo.getById(jobRoleId)
                            if (jobRole.name.includes(condition.keyword)) {
                                checkKeyWord++
                                break
                            }
                        }
                        if (checkKeyWord === 0) {
                            continue
                        }
                    } else if (condition.keyword_type === '4') {
                        let checkKeyWord = 0
                        for (let skillId of post.skill_ids) {
                            const skill = await this._skillRepo.getById(skillId)
                            if (skill.name.includes(condition.keyword)) {
                                checkKeyWord++
                                break
                            }
                        }
                        if (checkKeyWord === 0) {
                            continue
                        }
                    } else if (condition.keyword_type === '5') {
                        const industry = await this._industryRepo.getById(post.industry_id)
                        if (!industry.name.includes(condition.keyword)) {
                            continue
                        }
                    } else if (condition.keyword_type === '6') {
                        let checkKeyWord = 0
                        for (let langId of post.language_ids) {
                            const language = await this._languageRepo.getById(langId)
                            if (language.name.includes(condition.keyword)) {
                                checkKeyWord++
                                break
                            }
                        }
                        if (checkKeyWord === 0) {
                            continue
                        }
                    } else if (condition.keyword_type === '7' && !post.content.includes(condition.keyword)) {
                        continue
                    } else if (condition.keyword_type === '8' && !post.require.includes(condition.keyword)) {
                        continue
                    } else if (condition.keyword_type === '9' && !post.benefit.includes(condition.keyword)) {
                        continue
                    } else if (condition.keyword_type === '10' && !post.notice_for_referrer.includes(condition.keyword)) {
                        continue
                    }
                    if (condition.urgency === '1' && post.urgency === true) {
                        continue
                    }
                    else if (condition.urgency === '2' && post.urgency === false) {
                        continue
                    }
                    if (condition.negotiable === '1' && post.negotiable === true) {
                        continue
                    }
                    else if (condition.negotiable === '2' && post.negotiable === false) {
                        continue
                    }
                    if (condition.company_id !== '0') {
                        const listCompany = condition.company_id.split(',')
                        if (!listCompany.includes(post.company_id)) {
                            continue
                        }
                    }
                    if (condition.city_ids !== '0' && !condition.city_ids.includes(post.city_ids)) {
                        continue
                    }
                    if (condition.status === '1' && post.status !== 'active') {
                        continue
                    } else if (condition.status === '2' && post.status !== 'pause') {
                        continue
                    } else if (condition.status === '3' && post.status !== 'lock') {
                        continue
                    }
                    if (condition.type_work !== '0' && post.type_work !== condition.type_work) {
                        continue
                    }
                    if (condition.guarantee === '1' && (post.guarantee <= 0 || post.guarantee >= 100)) {
                        continue
                    } else if (condition.guarantee === '2' && post.guarantee !== 100) {
                        continue
                    } else if (condition.guarantee === '3' && post.guarantee !== 0) {
                        continue
                    }
                    //
                    if (condition.currency !== '0' && condition.currency !== post.currency) {
                        continue
                    }
                    if (condition.salary_to !== undefined && post.salary_to > condition.salary_to) { // chon cai lon nhat
                        continue
                    }
                    if (condition.salary_from !== undefined && post.salary_from < condition.salary_from) { // chon cai lon nhat
                        continue
                    }
                    listPosts.push({id: savePost._id, post: post})
                }
            }

        }

        if (sortBy === 0) {
            listPosts.sort((a, b) => (a.date_on > b.date_on) ? -1 : ((b.date_on > a.date_on) ? 1 : 0))
        } else if (sortBy === 1) {
            listPosts.sort((a, b) => (a.title > b.title) ? -1 : ((b.title > a.title) ? 1 : 0))
        }
        else if (sortBy === 3) {
            listPosts.sort((a, b) => (a.bonus > b.bonus) ? 1 : ((b.bonus > a.bonus) ? -1 : 0))
        } else if (sortBy === 4) {
            listPosts.sort((a, b) => (a.bonus > b.bonus) ? -1 : ((b.bonus > a.bonus) ? 1 : 0))
        }
        else if (sortBy === 5) { // tăng dần 
            listPosts.sort((a, b) => (a.salary_from > b.salary_from) ? 1 : ((b.salary_from > a.salary_from) ? -1 : 0))
        } else if (sortBy === 6) {
            listPosts.sort((a, b) => (a.salary_from > b.salary_from) ? -1 : ((b.salary_from > a.salary_from) ? 1 : 0))
        }
        let savePosts = []
        for (let savePost of listPosts) {
            let guarantee_type = ''
            if (savePost.post.guarantee === 0) {
                guarantee_type = 'Comprehensive warranty'
            } else if (savePost.post.guarantee > 0 && savePost.post.guarantee < 100) {
                guarantee_type = 'Periodic warranty'
            } else if (savePost.post.guarantee === 100) {
                guarantee_type = 'No warranty'
            }
            const company = await this._companyRepo.getById(savePost.post.company_id)
            let pathFile  = null
            if(company.image_file_id !== null){
               const fileImage = await this._fileRepo.getById(company.image_file_id)
               if(fileImage !== null){
                  pathFile = '/static/company_images/'+fileImage.name 
               }
            }
            let listCity = []
            for (let cityId of savePost.post.city_ids) {
                const dto = await this._cityRepo.getById(cityId)
                const city = {
                    id: dto._id,
                    name: dto.title
                }
                listCity.push(city)
            }
            const postReturn = {
                id: savePost.id,
                post_id: savePost.post._id,
                status: savePost.post.status,
                company_name: company.company,
                company_image: pathFile,
                require_number: savePost.post.require_number,
                salary_from: savePost.post.salary_from,
                salary_to: savePost.post.salary_to,
                guarantee: {
                    name: guarantee_type,
                    value: savePost.post.guarantee
                },
                locations: listCity,
                title: savePost.post.title,
                commission: savePost.post.commission,
                currency: savePost.post.currency
            }
            savePosts.push(postReturn)
        }
        if (sortBy === 2) {
            savePosts = savePosts.sort((a, b) => a.company_name.toLowerCase().localeCompare(b.company_name.toLowerCase()))
        }
        const totalCount = savePosts.length
        savePosts = savePosts.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)
        const result = {
            pageIndex,
            pageSize,
            totalPages: Math.ceil(totalCount / pageSize),
            totalCount,
            savePosts: savePosts
        }
        return result
    }
}