import { inject, injectable } from "inversify";
import { IntroductionStatus, JobGuarantee } from "../../common/constants";
import { CandidateIntroduction } from "../../entities/candidate_introduction";
import { Warranty } from "../../entities/warranty";
import { Token } from "../../JwtToken/JwtToken";
import { ICandidateIntroductionRepository } from "../../repositories/candidate_introduction.repository";
import { ICandidateIntroductionStatusHistoryRepository } from "../../repositories/candidate_introduction_status_history.repository";
import { IPostRepository } from "../../repositories/post.repository";
import { IWarrantyRepository } from "../../repositories/warranty.repository";
import { TYPES } from "../../types";

export interface IWarrantyService{
    createWarranty(bearerToken: string, warranty: Warranty): Promise<{warrantyId: string, message: string, status: number}>
}
    

@injectable()
export class WarrantyService implements IWarrantyService {
    @inject(TYPES.IWarrantyRepository) private readonly _warrantyRepo: IWarrantyRepository
    @inject(TYPES.IPostRepository) private readonly _postRepo: IPostRepository
    @inject(TYPES.ICandidateIntroductionRepository) private readonly _candidateIntroductionRepo: ICandidateIntroductionRepository
    @inject(TYPES.ICandidateIntroductionStatusHistoryRepository) private readonly _statusHistoryRepo: ICandidateIntroductionStatusHistoryRepository
    @inject(TYPES.Token) private readonly _jwtToken: Token

    public async createWarranty(bearerToken: string, warranty: Warranty): Promise<{warrantyId: string, message: string, status: number}>{
        const employer = this._jwtToken.getUserInfo(bearerToken)
        if(employer.permission.includes('candidate.all') || employer.permission.includes('candidate.waraanty')){
            // đang bốc thag D để bảo hành cho thag C
            // thag C guaranteedCandidateIntroduction
            const guaranteedCandidateIntroduction: CandidateIntroduction = await this._candidateIntroductionRepo.getById(warranty.guaranteed_candidate_introuduction_id)
            if(guaranteedCandidateIntroduction !== null){ // nếu thằng mình bảo hành cho nó khác null
                
                const statusHistoriesOfGuaranteed = await this._statusHistoryRepo.findByCondition({candidate_introduction_id: guaranteedCandidateIntroduction._id.toString()})
                const statusNewestOfGuaranteed = statusHistoriesOfGuaranteed.sort((a,b) => b.time - a.time)[0]
                if(statusNewestOfGuaranteed.status !== IntroductionStatus.RESIGN){ // nếu thag mà mình bảo hành nó chưa fail thì ko bảo hành được
                    return {warrantyId: '', message: 'Can not wanrraty candidate not resign', status: 2}
                }
                const alternativeCandidateIntrouduction = await this._candidateIntroductionRepo.getById(warranty.alternative_candidate_introuduction_id)
                if(alternativeCandidateIntrouduction === null){
                    return {warrantyId: '', message: 'The alternative candidate introduction is not found', status: 1}
                }
                const statusHistoriesAlternative = await this._statusHistoryRepo.findByCondition({candidate_introduction_id: alternativeCandidateIntrouduction._id.toString()})
                const statusNewestAlternative = statusHistoriesAlternative.sort((a,b) => b.time - a.time)[0]
                if(statusNewestAlternative.status === IntroductionStatus.ONBOARD){
                    return {warrantyId: '', message: 'Can not get an already onboard candidate to replace', status: 4}
                }
                if(alternativeCandidateIntrouduction.post_id !== guaranteedCandidateIntroduction.post_id){
                    return {warrantyId: '', message: 'The alternative candidate introduction and guaranteed candidate introduction must apply the same job', status: 4}
                }
                const post = await this._postRepo.getById(guaranteedCandidateIntroduction.post_id)
                if(post === null){
                    return {warrantyId: '', message: 'The post is not found', status: 1}
                }
                let listCandidateIdToCheck = [
                    guaranteedCandidateIntroduction._id.toString(),
                    alternativeCandidateIntrouduction._id.toString()
                ]
                const checkGuaranteedCandidateWarranty = await this._warrantyRepo.findByCondition({$or: [{guaranteed_candidate_introuduction_id:{ $in: listCandidateIdToCheck }}, {alternative_candidate_introuduction_id: {$in: listCandidateIdToCheck}}]})
                if(checkGuaranteedCandidateWarranty.length !== 0){
                    return {warrantyId: '', message:'Only one warranty for one candidate ', status: 6}
                }

                const guaranteedDate = post.guarantee_date
                
                if(post.guarantee_type === JobGuarantee.PERIODICWARRANTY){
                    let difference_In_Days = 0
                    if(guaranteedCandidateIntroduction.work_end_date !== null){
                        const difference_In_Time = guaranteedCandidateIntroduction.work_end_date - guaranteedCandidateIntroduction.onboard_date; // thag B là được nhiêu ngày rồi
                        // To calculate the no. of days between two dates
                        difference_In_Days = difference_In_Time / (1000 * 3600 * 24); // so ngay
                    }
                    let tmpDate = difference_In_Days // thag C làm được nhiêu ngày rồi
                    warranty.number_of_warranty_days = guaranteedDate - tmpDate
                }
                else if(post.guarantee_type === JobGuarantee.COMPREHENSIVEWARRANTY){ // nếu bảo hành toàn diện
                    warranty.number_of_warranty_days = post.guarantee_date
                }
                const result = await this._warrantyRepo.create(warranty)
                if(result !== null){
                    return {warrantyId: result._id.toString(), message: 'Success', status: 0}
                }
                return {warrantyId: '', message: 'Create failed', status: 3}  
            }
            return {warrantyId: '', message: 'The guaranteed candidate introduction is not found', status: 1}
        }
        return {warrantyId: '', message: 'Permission is required', status: 5}
    }   
} 