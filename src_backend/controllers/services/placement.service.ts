import { inject, injectable } from "inversify";
import { IntroductionStatus, JobGuarantee, NotifyIconUrl, NotifyType, PaymentStatus, TAtatoolUrl } from "../../common/constants";
import { Notification } from "../../entities/notification";
import { Placement } from "../../entities/placement";
import { exportExcel } from "../../excel.service";
import { sendNotification } from "../../firebase";
import { Token } from "../../JwtToken/JwtToken";
import { IBankAccountRepository } from "../../repositories/bank_account.repository";
import { ICandidateRepository } from "../../repositories/candidate.repository";
import { ICandidateIntroductionRepository } from "../../repositories/candidate_introduction.repository";
import { ICandidateIntroductionStatusHistoryRepository } from "../../repositories/candidate_introduction_status_history.repository";
import { ICompanyRepository } from "../../repositories/company.repository";
import { INotificationRepository } from "../../repositories/notification.repository";
import { IPlacementRepository } from "../../repositories/placement.repository";
import { IPostRepository } from "../../repositories/post.repository";
import { IUserRepository } from "../../repositories/user.repository";
import { IWarrantyRepository } from "../../repositories/warranty.repository";
import { TYPES } from "../../types";

export interface IPlacementService {
    detailPlacement(placementId: string): Promise<{ placement: {}, message: string, status: number }>
    //updateStatusPayment(placementId: string, status: string): Promise<{placementId: string, message: string, status: number}>
    searchPlacementForCollaborator(bearerToken: string, condition, pageIndex: number, pageSize: number, sortBy: number): Promise<{
        pageIndex: number,
        pageSize: number,
        totalPages: number,
        totalCount: number,
        placements: any[]
    }>
    searchPlacementForEmployer(bearerToken: string, condition, pageIndex: number, pageSize: number, sortBy: number): Promise<{
        pageIndex: number,
        pageSize: number,
        totalPages: number,
        totalCount: number,
        message: string,
        status: number,
        placements: any[],
        totalAmountUSD: string,
        totalAmountVND: string
    }>
    createPlacement(bearerToken: string, placement: Placement): Promise<{ placementId: string, message: string, status: number }>
    exportToExcel(dataToExport: any[]): Promise<string>
    viewDetailBeforeCreatePlacement(bearerToken: string, candidateIntroductionId: string): Promise<{ data: {}, message: string, status: number }>
    updateStatusPlacement(bearerToken: string, placementId: string, listStatus: string[]): Promise<{ message: string, status: number }>
    viewPlacementHistoryOfCollaborator(bearerToken: string, collaboratorId: string): Promise<{ placements: any[], message: string, status: number }>
    viewDetailPlacement(bearerToken: string, placementId: string): Promise<{ placement: {}, message: string, status: number }>
}


@injectable()
export class PlacementService implements IPlacementService {
    @inject(TYPES.IPlacementRepository) private readonly _placementRepo: IPlacementRepository
    @inject(TYPES.IUserRepository) private readonly _userRepo: IUserRepository
    @inject(TYPES.IPostRepository) private readonly _postRepo: IPostRepository
    @inject(TYPES.ICandidateRepository) private readonly _candidateRepo: ICandidateRepository
    @inject(TYPES.IBankAccountRepository) private readonly _bankAccountRepo: IBankAccountRepository
    @inject(TYPES.ICandidateIntroductionRepository) private readonly _candidateIntroductionRepo: ICandidateIntroductionRepository
    @inject(TYPES.ICandidateIntroductionStatusHistoryRepository) private readonly _statusHistoryRepo: ICandidateIntroductionStatusHistoryRepository
    @inject(TYPES.IWarrantyRepository) private readonly _warrantyRepo: IWarrantyRepository
    @inject(TYPES.ICompanyRepository) private readonly _companyRepo: ICompanyRepository
    @inject(TYPES.INotificationRepository) private readonly _notifyRepo: INotificationRepository
    @inject(TYPES.Token) private readonly _jwtToken: Token


    public async detailPlacement(placementId: string): Promise<{ placement: {}, message: string, status: number }> {
        const placement = await this._placementRepo.getById(placementId)
        if (placement !== null) {
            const candidateIntroduction = await this._candidateIntroductionRepo.getById(placement.candidate_introduction_id)
            const post = await this._postRepo.getById(candidateIntroduction.post_id)
            if (post === null) {
                return { placement: '', message: 'The post is not found', status: 1 }
            }
            const candidate = await this._candidateRepo.getById(candidateIntroduction.candidate_id)
            if (candidate === null) {
                return { placement: '', message: 'The candidate is not found', status: 1 }
            }
            const collaborator = await this._userRepo.getById(candidate.collaborator_id)
            if (collaborator === null || collaborator.status !== 'approval') {
                return { placement: '', message: 'The candidate is not found or not approval', status: 1 }
            }
            const bankAccount = await this._bankAccountRepo.getById(collaborator.bank_id)
            let bankAccountNumber = null
            if (bankAccount !== null) {
                bankAccountNumber = bankAccount.account_number
            }
            const returnDto = {
                postId: post._id.toString(),
                postTitle: post.title,
                bonus: post.bonus,
                commission: post.commission,
                candidateId: candidate._id.toString(),
                candidateName: candidate.name,
                candidateEmail: candidate.email,
                candidatePhone: candidate.phone,
                bankAccountNumber,
                placementDate: placement.placement_date,
                paymentStatus: placement.payment_status,
                rewardAmount: placement.reward_amount,
                createdDate: placement.created_date
            }
            return { placement: returnDto, message: 'Success', status: 0 }
        }
        return { placement: {}, message: 'The placement is not found', status: 1 }
    }

    public async updateStatusPayment(placementId: string, status: string): Promise<{ placementId: string, message: string, status: number }> {
        const placement = await this._placementRepo.getById(placementId)
        if (placement !== null) {
            const result = await this._placementRepo.update(placementId, { payment_status: status })
            if (result !== null) {
                return { placementId: placementId, message: 'Success', status: 0 }
            }
        }
        return { placementId: '', message: 'The placement is not found', status: 1 }
    }

    public async searchPlacementForCollaborator(bearerToken: string, condition, pageIndex: number, pageSize: number, sortBy: number): Promise<{
        pageIndex: number,
        pageSize: number,
        totalPages: number,
        totalCount: number,
        placements: any[]
    }> {
        const userData = this._jwtToken.getUserInfo(bearerToken)
        const offset = pageSize * pageIndex
        let listCompany: string[] = []
        let conditionSearchPost = {
            title: { $regex: condition.keyword, $options: 'i' },
            company_id : {}
        }
        if (condition.companyIds === '0') {
            delete condition.companyIds
            delete conditionSearchPost.company_id
        } else {
            listCompany = condition.companyIds.split(',')
            conditionSearchPost['company_id'] = { $in: listCompany }
            delete condition.companyIds
        }
        let conditionSearchPlacement = {
            candidate_introduction_id: {},
            payment_status: {}
        }
        const paymentStatus = condition.payment_status
        switch (paymentStatus) {
            case '0':
                delete condition.payment_status
                delete conditionSearchPlacement.payment_status
                break;
            case '1':
                conditionSearchPlacement.payment_status = {$in: [PaymentStatus.WAITING]}
                break;
            case '2':
                conditionSearchPlacement.payment_status = {$in: [PaymentStatus.PAYMENTCOMPLETED]}
                break;
            case '3':
                conditionSearchPlacement.payment_status = {$in: [PaymentStatus.PAYMENTFAILED]}
                break;
            default:
                break;
        }
        const listCandidateId = await this._candidateRepo.getListIdByCondition({ name: { $regex: condition.keyword, $options: 'i' }, collaborator_id: userData.id })
        let listCandidateIdApplied = []
        for (let id of listCandidateId) {
            const listCandidateIntroducion = await this._candidateIntroductionRepo.findByCondition({ candidate_id: id })// search candidate by name
            if (listCandidateIntroducion.length !== 0) {
                listCandidateIdApplied.push(id)
            }
        }
        let conditionFinally: any = {}
        let conditionCandidateIntroduction = []
        conditionCandidateIntroduction.push({ candidate_id: { $in: listCandidateIdApplied } }) // list canddate search by name
        const listPostId = await this._postRepo.getListIdByCondition(conditionSearchPost) // search post by title
        conditionCandidateIntroduction.push({ post_id: { $in: listPostId } })
        
        conditionFinally.$or = conditionCandidateIntroduction
       
        let listCandidateIntroductionId = []
        const listResult = await this._candidateIntroductionRepo.findByCondition(conditionFinally)
        for (let candidateIntroduction of listResult) { // Lọc những kết quả introduction search theo post title
            let flag = true
            const post = await this._postRepo.getById(candidateIntroduction.post_id)
            const candidate = await this._candidateRepo.getById(candidateIntroduction.candidate_id)
            if(listCompany.length !== 0 && !listCompany.includes(post.company_id.toString())){
                flag = false
            }else if (candidate.collaborator_id !== userData.id) {
                flag = false
            }
            if(flag){
                listCandidateIntroductionId.push(candidateIntroduction._id.toString())
            }  
        }
        //
        conditionSearchPlacement.candidate_introduction_id = {$in: listCandidateIntroductionId}
        const result = await this._placementRepo.findByConditionAndPaging(conditionSearchPlacement, offset, pageSize, {})
        const listPlacement = result.data
        let listReturn = []
        for (let placement of listPlacement) {
            const candidateIntroduction = await this._candidateIntroductionRepo.getById(placement.candidate_introduction_id)
            const candidate = await this._candidateRepo.getById(candidateIntroduction.candidate_id)
            const post = await this._postRepo.getById(candidateIntroduction.post_id)
            const company = await this._companyRepo.getById(post.company_id)
            const collaborator = await this._userRepo.getById(userData.id)
            let bankAccountName = null
            let bankNumber = null
            let bankName = null
            if(collaborator.bank_id !== null){
                const bank = await this._bankAccountRepo.getById(collaborator.bank_id)
                if(bank !== null){
                    bankAccountName = bank.bank_account_fullname
                    bankNumber = bank.account_number
                    bankName = bank.bank_name
                }
            }
            const returnDto = {
                placementId: placement._id.toString(),
                candidateName: candidate.name,
                postTitle: post.title,
                paymentStatus: placement.payment_status,
                placementDate: placement.placement_date,
                rewardAmount: placement.reward_amount,
                currency: post.currency,
                bonus: placement.bonus,
                createdDate: placement.created_date,
                candidate_introduction_id: candidateIntroduction._id.toString(),
                company: company.company,
                collaboratorName: collaborator.first_name + ' '+ collaborator.last_name,
                collaboratorEmail: collaborator.email,
                collaboratorPhone: collaborator.phone,
                bankAccountName,
                bankNumber,
                bankName,
                percentWarranty: post.guarantee +'%',
                warrantyType: post.guarantee_type
            }
            listReturn.push(returnDto)
            
            
        }
        if (sortBy === 0) {
            listReturn = listReturn.sort((a, b) => b.createdDate - a.createdDate)
        } else if (sortBy === 1) { // sort name
            listReturn = listReturn.sort((a, b) => a.candidateName.toLowerCase().localeCompare(b.candidateName.toLowerCase()))
        } else if (sortBy === 2) { // sort post title
            listReturn = listReturn.sort((a, b) => a.postTitle.toLowerCase().localeCompare(b.postTitle.toLowerCase()))
        }
        const dtoReturn = {
            pageIndex,
            pageSize,
            totalPages: result.infoPaging.totalPages,
            totalCount: result.infoPaging.totalDocs,
            placements: listReturn
        }
        return dtoReturn

    }

    public async searchPlacementForEmployer(bearerToken: string, condition, pageIndex: number, pageSize: number, sortBy: number): Promise<{
        pageIndex: number,
        pageSize: number,
        totalPages: number,
        totalCount: number,
        message: string,
        status: number,
        placements: any[],
        totalAmountUSD: string,
        totalAmountVND: string
    }> {
        const employer = this._jwtToken.getUserInfo(bearerToken)
        const offset = pageSize * pageIndex
        if (employer.permission.includes('placement.all') || employer.permission.includes('placment.search')) {
            let conditionSearchPost = {
                title: { $regex: condition.keyword, $options: 'i' }
            }
            let conditionSearchCandidate = {
                name: { $regex: condition.keyword, $options: 'i' }
            }
            if(condition.collaborator_id !== undefined){
                conditionSearchCandidate["collaborator_id"] = condition.collaborator_id
            }
            delete condition.collaborator_id // nếu undefined thì vẫn có thể không ảnh hưởng, nhưng nên xóa để code clean
            let listCompany: string[] = []
            if (condition.companyIds === '0') {
                delete condition.companyIds
            } else {
                listCompany = condition.companyIds.split(',')
                conditionSearchPost['company_id'] = { $in: listCompany }
                delete condition.companyIds
            }
            let conditionSearchPlacement = {
                candidate_introduction_id: {},
                payment_status: {}
            }
            const paymentStatus = condition.payment_status
            switch (paymentStatus) {
                case '0':
                    delete condition.payment_status
                    delete conditionSearchPlacement.payment_status
                    break;
                case '1':
                    conditionSearchPlacement.payment_status = {$in: [PaymentStatus.WAITING]}
                    break;
                case '2':
                    conditionSearchPlacement.payment_status = {$in: [PaymentStatus.PAYMENTCOMPLETED]}
                    break;
                case '3':
                    conditionSearchPlacement.payment_status = {$in: [PaymentStatus.PAYMENTFAILED]}
                    break;
                default:
                    break;
            }

            const listCandidateId = await this._candidateRepo.getListIdByCondition(conditionSearchCandidate) // search name candidate 
            const listPostId = await this._postRepo.getListIdByCondition(conditionSearchPost) // search post by title
            let conditionOr = []
            conditionOr.push({ post_id: { $in: listPostId } })
            conditionOr.push({ candidate_id: { $in: listCandidateId } })
            condition.$or = conditionOr

            delete condition.keyword
            //const listCandidateIntroductionId = await this._candidateIntroductionRepo.getListIdByCondition(condition)
            let listCandidateIntroductionId = []
            const listResult = await this._candidateIntroductionRepo.findByCondition(condition)
            for (let candidateIntroduction of listResult) { // Lọc những kết quả introduction search theo post title
                let flag = true
                const post = await this._postRepo.getById(candidateIntroduction.post_id)
                const candidate = await this._candidateRepo.getById(candidateIntroduction.candidate_id)
                if(listCompany.length !== 0 && !listCompany.includes(post.company_id.toString())){
                    flag = false
                }
                if(conditionSearchCandidate["collaborator_id"] !== undefined && candidate.collaborator_id !== conditionSearchCandidate["collaborator_id"]){
                    flag = false
                }
                if(flag){
                    listCandidateIntroductionId.push(candidateIntroduction._id.toString())
                }  
            }
            conditionSearchPlacement.candidate_introduction_id = listCandidateIntroductionId
            const result = await this._placementRepo.findByConditionAndPaging(conditionSearchPlacement, offset, pageSize, {})
            const listPlacement = result.data
            let listReturn = []
            let totalAmountUSD = 0
            let totalAmountVND = 0
            for (let placement of listPlacement) {
                const candidateIntroduction = await this._candidateIntroductionRepo.getById(placement.candidate_introduction_id)
                const candidate = await this._candidateRepo.getById(candidateIntroduction.candidate_id)
                const collaborator = await this._userRepo.getById(candidate.collaborator_id)
                const post = await this._postRepo.getById(candidateIntroduction.post_id)
                const company = await this._companyRepo.getById(post.company_id)
                let bankAccountName = null
                let bankNumber = null
                let bankName = null
                for(let amount of placement.reward_amount){
                    if(placement.currency === "USD"){
                        totalAmountUSD += amount 
                    }else if(placement.currency === "VND"){
                        totalAmountVND += amount
                    }
                }
                if(collaborator.bank_id !== null){
                    const bank = await this._bankAccountRepo.getById(collaborator.bank_id)
                    if(bank !== null){
                        bankAccountName = bank.bank_account_fullname
                        bankNumber = bank.account_number
                        bankName = bank.bank_name
                    }
                }
                const returnDto = {
                    candidate_introduction_id: candidateIntroduction._id.toString(),
                    placementId: placement._id.toString(),
                    candidateName: candidate.name,
                    postTitle: post.title,
                    paymentStatus: placement.payment_status,
                    placementDate: placement.placement_date,
                    bonus: placement.bonus,
                    currency: post.currency,
                    rewardAmount: placement.reward_amount,
                    createdDate: placement.created_date,
                    company: company.company,
                    collaboratorName: collaborator.first_name + ' '+ collaborator.last_name,
                    collaboratorEmail: collaborator.email,
                    collaboratorPhone: collaborator.phone,
                    bankAccountName,
                    bankNumber,
                    bankName,
                    percentWarranty: post.guarantee +'%',
                    warrantyType: post.guarantee_type
                    
                }
                listReturn.push(returnDto)
            }
            if (sortBy === 0) {
                listReturn = listReturn.sort((a, b) => b.createdDate - a.createdDate)
            } else if (sortBy === 1) { // sort name
                listReturn = listReturn.sort((a, b) => a.candidateName.toLowerCase().localeCompare(b.candidateName.toLowerCase()))
            } else if (sortBy === 2) { // sort post title
                listReturn = listReturn.sort((a, b) => a.postTitle.toLowerCase().localeCompare(b.postTitle.toLowerCase()))
            }

            const dtoReturn = {
                pageIndex,
                pageSize,
                totalPages: result.infoPaging.totalPages,
                totalCount: result.infoPaging.totalDocs,
                message: 'Success',
                status: 0,
                placements: listReturn,
                totalAmountUSD: totalAmountUSD + " USD",
                totalAmountVND: totalAmountVND + " VND"
            }
            return dtoReturn
        }
        return {
            pageIndex: 0,
            pageSize: 0,
            totalPages: 0,
            totalCount: 0,
            message: 'Permission is required',
            status: 1,
            placements: [],
            totalAmountUSD: "",
            totalAmountVND:"",
        }

    }

    public async exportToExcel(dataToExport: any[]): Promise<string> {
        const filename = 'Placement_' + new Date().toDateString() + '.xlsx'
        // let tmp = [
        //     {
        //         candidate_introduction_id: 'a',
        //         candidateName: 'b',
        //         postTitle: 'c',
        //         company: 'e',
        //         collaboratorName: 'f',
        //         collaboratorEmail: 'g',
        //         collaboratorPhone: 'h',
        //         bankName: 'csc',
        //         bankAccountName: 'i',
        //          placementDate: [],
        //         bankNumber: 'j',
        //         currency: 'USD',
        //         rewardAmount: [500, 100],
        //         bonus: 'l',
        //         status: ['waiting', 'completed'],
        //         percentWarranty: 'm',
        //         warrantyType: 'd'

        //     }
        // ]
        for(let t of dataToExport){
            let commission = ''
            let mainStatus = ''
            let placementDate = ''
            if(t.bonus === null){
                t.bonus = 0
            }
            for(let index = 0; index < t.rewardAmount.length; index++){
                let status = t.status[index] 
                let com = t.rewardAmount[index]
                let placeDate = t.placementDate[index]
                commission+= 'Stage '+(index +1)+': '+com +'\n'
                mainStatus += 'Stage '+(index +1)+': '+ status +'\n'
                placementDate +='Stage '+(index +1)+': '+ new Date(placeDate).toDateString() +'\n'
            }
            delete t.rewardAmount
            delete t.status
            delete t.placementDate
            t['commission'] = commission
            t['statusOfPlacement'] = mainStatus
            t['listPlacementDate'] = placementDate
        }
        const columns = [
            { header: 'Introduction ID', key: 'candidate_introduction_id' },
            { header: 'Candidate name', key: 'candidateName' },
            { header: 'Post title', key: 'postTitle' },
            { header: 'Company', key: 'company' },
            { header: 'Collaborator name', key: 'collaboratorName' },
            { header: 'Collaborator email', key: 'collaboratorEmail' },
            { header: 'Collaborator phone', key: 'collaboratorPhone' },
            { header: 'Bank name', key: 'bankName' },
            { header: 'Bank account name', key: 'bankAccountName' },
            { header: 'Bank number', key: 'bankNumber' },
            { header: 'Bonus', key: 'bonus' },
            { header: 'Commission', key: 'commission' },
            { header: 'Currency', key: 'currency' },
            { header: 'Status of placement', key: 'statusOfPlacement' },
            { header: 'Placement date', key: 'listPlacementDate' },
            { header: 'Percent warranty', key: 'percentWarranty' },
            { header: 'Warranty type', key: 'warrantyType' }
           
        ]
        const pathExcel = await exportExcel(columns, dataToExport, filename, 'Placements')
        return pathExcel
    }

    public async createPlacement(bearerToken: string, placement: Placement): Promise<{ placementId: string, message: string, status: number }> {
        const employerData = this._jwtToken.getUserInfo(bearerToken)
        if (employerData.permission.includes('candidate.all') || employerData.permission.includes('candidate.create_placement')) {
            const candidateIntroduction = await this._candidateIntroductionRepo.getById(placement.candidate_introduction_id)
            if (candidateIntroduction !== null) { // check xem có candidate introduction ko 

                const checkPlacementExsited = await this._placementRepo.findByCondition({ candidate_introduction_id: candidateIntroduction._id.toString() })
                if (checkPlacementExsited.length !== 0) {  // nếu candidate này có placement rồi thì báo lỗi
                    return { placementId: '', message: 'Already have placement for this candiate', status: 3 }
                }

                const newestStatus = await this._statusHistoryRepo.getNewestStatus(candidateIntroduction._id.toString())
                if (newestStatus.status !== IntroductionStatus.ONBOARD && newestStatus.status !== IntroductionStatus.COMPLETED) { //complete thì mới được tạo placement
                    return { placementId: '', message: 'Can not create placement for candidate without status onboard or completed', status: 2 }
                }
                placement.created_date = new Date().getTime()
                placement.created_by = employerData.id
                const result = await this._placementRepo.create(placement)
                if (result !== null) {
                    const candidate = await this._candidateRepo.getById(candidateIntroduction.candidate_id)
                    const collaborator = await this._userRepo.getById(candidate.collaborator_id)
                    let data = { title: 'Tạo thanh toán cho ứng viên ', content: `Ứng cử viên ${candidate.name} được tạo thanh toán` }
                    let notifyDto = new Notification()
                    notifyDto.title = data.title
                    notifyDto.content = data.content
                    notifyDto.type = NotifyType.PLACEMENT
                    notifyDto.time = new Date().getTime()
                    notifyDto.link = TAtatoolUrl.PLACEMENT
                    notifyDto.image = NotifyIconUrl.PLACEMENT
                    notifyDto.receiver_id = collaborator._id.toString()
                    const notifyRecord = await this._notifyRepo.create(notifyDto)
                    if (collaborator.fcm_token !== null) {
                        sendNotification(collaborator.fcm_token, data)
                    }
                }
                return { placementId: result._id.toString(), message: 'Successs', status: 0 }
            }
            // error
            return { placementId: '', message: 'The candidate introduction is not found', status: 1 }
        }
        return { placementId: '', message: 'Permission is required', status: 4 }
    }

    public async viewDetailBeforeCreatePlacement(bearerToken: string, candidateIntroductionId: string): Promise<{ data: {}, message: string, status: number }> {
        const employer = this._jwtToken.getUserInfo(bearerToken)
        if (employer.permission.includes('candidate.all') || employer.permission.includes('candidate.create_placement')) {
            const candidateIntroduction = await this._candidateIntroductionRepo.getById(candidateIntroductionId)
            if (candidateIntroduction !== null) {
                const statusHistories = await this._statusHistoryRepo.findByCondition({ candidate_introduction_id: candidateIntroduction._id.toString() })
                const statusNewest = statusHistories.sort((a, b) => b.time - a.time)[0] // lấy status mới nhất 
                if (statusNewest.status !== IntroductionStatus.ONBOARD && statusNewest.status !== IntroductionStatus.COMPLETED && statusNewest.status !== IntroductionStatus.RESIGN) {
                    return { data: {}, message: 'Can not create placement if status candidate introduction is not onboard, completed or resign, resign', status: 3 }
                }
                const post = await this._postRepo.getById(candidateIntroduction.post_id)
                const candidate = await this._candidateRepo.getById(candidateIntroduction.candidate_id)
                const collaborator = await this._userRepo.getById(candidate.collaborator_id)
                if (collaborator.status !== 'approval') {
                    return { data: {}, message: 'This collaborator is not approval', status: 2 }
                }
                let placementDate: number[] = []
                let rewardAmount: number[] = []
                let paymentStatus: string[] = []
                let bonus = null
                let onboardDate = candidateIntroduction.onboard_date
                const warrantyCheck = await this._warrantyRepo.findByCondition({ alternative_candidate_introuduction_id: candidateIntroductionId })

                if ((post.guarantee_type === JobGuarantee.PERIODICWARRANTY)) { // giai đoạn
                    let dayInMiliseconds = 1000 * 60 * 60 * 24 * post.guarantee_date
                    placementDate.push(onboardDate)
                    placementDate.push((onboardDate + dayInMiliseconds))
                    paymentStatus.push(PaymentStatus.WAITING)
                    paymentStatus.push(PaymentStatus.WAITING)
                    // nếu là bảo hành theo giai đoạn 
                    let tmp = (post.commission * post.guarantee) / 100
                    let tmp2 = post.commission - tmp
                    rewardAmount = [tmp, tmp2]

                    // xem thag mình đag tạo placement cho nó thì nó có đang bảo hành cho thag nào không
                    if (warrantyCheck.length !== 0) { // nghĩa là thag này đag bảo hành cho thga khác
                        /////////////////////
                        placementDate.pop()
                        rewardAmount.shift()
                        paymentStatus.shift()

                    }
                } else if (post.guarantee_type === JobGuarantee.COMPREHENSIVEWARRANTY) {// toàn diện

                    let dayInMiliseconds = 1000 * 60 * 60 * 24 * post.guarantee_date
                    placementDate.push(onboardDate)
                    placementDate.push((onboardDate + dayInMiliseconds))
                    paymentStatus.push(PaymentStatus.WAITING)
                    paymentStatus.push(PaymentStatus.WAITING)
                    // nếu là bảo hành theo giai đoạn 
                    let tmp = (post.commission * post.guarantee) / 100
                    let tmp2 = post.commission - tmp
                    rewardAmount = [tmp, tmp2]

                    if (warrantyCheck.length !== 0) { // nghĩa là thag này đag bảo hành cho thga khác
                        /////////////////////
                        dayInMiliseconds = 1000 * 60 * 60 * 24 * warrantyCheck[0].number_of_warranty_days
                        placementDate[1] = (onboardDate + dayInMiliseconds)
                        placementDate.shift()
                        rewardAmount.shift()
                        paymentStatus.shift()
                    }
                }
                else if (post.guarantee_type === JobGuarantee.NOWARRANTY) { // ko baor hanh
                    placementDate.push(onboardDate)
                    rewardAmount = [post.commission]
                    paymentStatus.push(PaymentStatus.WAITING)
                }
                if (post.urgency) {
                    if (candidateIntroduction.onboard_date <= post.bonus_end_date && warrantyCheck.length === 0) {
                        bonus = post.bonus
                    }
                }

                let bankAccountNumber = null
                const bank = await this._bankAccountRepo.getById(collaborator.bank_id)
                if (bank !== null) {
                    bankAccountNumber = bank.account_number
                }

                const data = {
                    candidateId: candidate._id.toString(),
                    candidateName: candidate.name,
                    postId: post._id.toString(),
                    postTitle: post.title,
                    collaboratorName: collaborator.first_name + ' ' + collaborator.last_name,
                    collboratoroEmail: collaborator.email,
                    collaboratorPhone: collaborator.phone,
                    collaboratorBankAccountNumber: bankAccountNumber,
                    currency: post.currency,
                    status: paymentStatus,
                    bonus,
                    placementDate,
                    rewardAmount
                }
                return { data, message: 'Success', status: 0 }
            }
            return { data: {}, message: 'The candidate introduction is not found', status: 1 }
        }
        return { data: {}, message: 'Permission is required', status: 4 }
    }

    public async updateStatusPlacement(bearerToken: string, placementId: string, listStatus: string[]): Promise<{ message: string, status: number }> {
        const employer = this._jwtToken.getUserInfo(bearerToken)
        if (employer.permission.includes('placement.all') || employer.permission.includes('placement.update')) {
            const placement = await this._placementRepo.getById(placementId)
            if (placement !== null) {
                for (let index = 0; index < listStatus.length; index++) {
                    const status =''+ listStatus[index];
                    switch (status) {
                        case "1":
                            listStatus[index] = PaymentStatus.WAITING
                            break;
                        case "2":
                            listStatus[index] = PaymentStatus.PAYMENTCOMPLETED
                            break;
                        case "3":
                            listStatus[index] = PaymentStatus.PAYMENTFAILED
                            break
                        default:
                            break;
                    }
                }
                await this._placementRepo.update(placementId, { payment_status: listStatus })
                const candidateIntroduction = await this._candidateIntroductionRepo.getById(placement.candidate_introduction_id)
                const candidate = await this._candidateRepo.getById(candidateIntroduction.candidate_id)
                const collaborator = await this._userRepo.getById(candidate.collaborator_id)
                let data = { title: 'Cập nhật trạng thái thanh toán', content: `Ứng cử viên ${candidate.name} được cập nhật trạng thái thanh toán thành ` + listStatus }
                let notifyDto = new Notification()
                notifyDto.title = data.title
                notifyDto.content = data.content
                notifyDto.type = NotifyType.PLACEMENT
                notifyDto.time = new Date().getTime()
                notifyDto.link = TAtatoolUrl.PLACEMENT
                notifyDto.image = NotifyIconUrl.PLACEMENT
                notifyDto.receiver_id = collaborator._id.toString()
                const notifyRecord = await this._notifyRepo.create(notifyDto)
                if (collaborator.fcm_token !== null) {
                    sendNotification(collaborator.fcm_token, data)
                }
                return { message: 'Success', status: 0 }
            }
            return { message: 'The placement is not found', status: 1 }
        }
        return { message: 'Permission is required', status: 2 }
    }

    public async viewPlacementHistoryOfCollaborator(bearerToken: string, collaboratorId: string): Promise<{ placements: any[], message: string, status: number }> {
        const employer = this._jwtToken.getUserInfo(bearerToken)
        const collaborator = await this._userRepo.getById(collaboratorId)
        let placements: any[] = []
        if (collaborator !== null) {
            const listCandidateOfCollab = await this._candidateRepo.findByCondition({ collaborator_id: collaborator._id.toString() })
            for (let candidate of listCandidateOfCollab) {
                const candidateIntroductions = await this._candidateIntroductionRepo.findByCondition({ candidate_id: candidate._id.toString() })
                if (candidateIntroductions.length !== 0) {
                    const candidate = await this._candidateRepo.getById(candidateIntroductions[0].candidate_id)
                    const post = await this._postRepo.getById(candidateIntroductions[0].post_id)
                    const placement = await this._placementRepo.findByCondition({ candidate_introduction_id: candidateIntroductions[0]._id.toString() })
                    if (placement.length !== 0) {
                        const p = placement[0]
                        const returnDto = {
                            placementId: p._id.toString(),
                            reward_amount: p.reward_amount,
                            payment_status: p.payment_status,
                            placement_date: p.placement_date,
                            bonus: p.bonus,
                            currency: p.currency,
                            candidateIntroductionId: candidateIntroductions[0]._id.toString(),
                            candidateName: candidate.name,
                            postTitle: post.title
                        }
                        placements.push(returnDto)
                    }
                }
            }
            return { placements: placements, message: 'Success', status: 0 }
        }
        return { placements: [], message: 'The collaborator is not found', status: 1 }
    }

    public async viewDetailPlacement(bearerToken: string, placementId: string): Promise<{ placement: {}, message: string, status: number }> {
        const userData = this._jwtToken.getUserInfo(bearerToken)
        if (userData.type_account === 'employer' && !userData.permission.includes('placement.all') && !userData.permission.includes('placement.detail')) {
            return { placement: {}, message: 'Permission is required', status: 2 }
        }
        const placement = await this._placementRepo.getById(placementId)
        if (placement !== null) {
            const candidateIntroduction = await this._candidateIntroductionRepo.getById(placement.candidate_introduction_id)
            const candidate = await this._candidateRepo.getById(candidateIntroduction.candidate_id)
            const employerCreatePlacement = await this._userRepo.getById(placement.created_by)
            const post = await this._postRepo.getById(candidateIntroduction.post_id)
            const company = await this._companyRepo.getById(post.company_id)
            const collaborator = await this._userRepo.getById(candidate.collaborator_id)
            let bankAccountNumber = null
            if (collaborator.bank_id !== null) {
                const bankAccount = await this._bankAccountRepo.getById(collaborator.bank_id)
                bankAccountNumber = bankAccount.account_number
            }
            const returnDto = {
                placementId: placement._id.toString(),
                placementStatus: placement.payment_status,
                placementDate: placement.placement_date,
                rewardAmount: placement.reward_amount,
                createBy: employerCreatePlacement.first_name + ' ' + employerCreatePlacement.last_name,
                bonus: placement.bonus,
                currency: placement.currency,
                candidateId: candidate._id.toString(),
                candidateName: candidate.name,
                postId: post._id.toString(),
                postTitle: post.title,
                companyName: company.company,
                collaboratorId: collaborator._id.toString(),
                collaboratorName: collaborator.first_name + ' ' + collaborator.last_name,
                collaboratorEmail: collaborator.email,
                collaboratorPhone: collaborator.phone,
                collaboratorBankNumber: bankAccountNumber
            }
            return { placement: returnDto, message: 'Success', status: 0 }
        }
        return { placement: {}, message: 'The placement is not found', status: 1 }
    }

    
}