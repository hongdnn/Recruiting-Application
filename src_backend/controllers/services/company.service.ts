import { inject, injectable } from "inversify";
import { Company, ReturnDtoCompany } from "../../entities/company";
import { File } from "../../entities/file";
import { Function } from "../../entities/function";
import { Job } from "../../entities/job";
import { Token } from "../../JwtToken/JwtToken";
import { ICityRepository } from "../../repositories/city.repository";
import { ICompanyRepository } from "../../repositories/company.repository";
import { ICountryRepository } from "../../repositories/country.repository";
import { IFunctionRepository } from "../../repositories/function.repository";
import { IIndustryRepository } from "../../repositories/industry.repository";
import { IJobRepository } from "../../repositories/job.repository";
import { IUserRepository } from "../../repositories/user.repository";
import { TYPES } from "../../types";
import path from 'path'
import { IFileRepository } from "../../repositories/file.repository";
import { Constants } from "../../common/constants";
import fs from 'fs'
export interface ICompanyService{
    getAllCompany(): Promise<ReturnDtoCompany[]>
    createCompany(bearerToken: string,company: Company): Promise<{ id: string, message: string, status: number }>
    updateCompany(bearerToken: string,companyId: string, company: Company): Promise<{ id: string, message: string, status: number }>
    removeCompany(bearerToken: string,companyId: string): Promise<{ message: string, status: number }>
    searchCompany(condition, pageIndex: number, pageSize: number, sortBy: number): Promise<{
        companies: any[],
        pageIndex: number,
        pageSize: number,
        totalPages: number,
        totalCount: number
    }>
    getDetailCompany(bearerToken: string,companyId: string): Promise<{data: {}, message: string, status: number}>
}
    

@injectable()
export class CompanyService implements ICompanyService {
    @inject(TYPES.ICompanyRepository) private readonly _companyRepo: ICompanyRepository
    @inject(TYPES.IUserRepository) private readonly _userRepo: IUserRepository
    @inject(TYPES.IIndustryRepository) private readonly _industryRepo: IIndustryRepository
    @inject(TYPES.IFunctionRepository) private readonly _functionRepo: IFunctionRepository
    @inject(TYPES.IJobRepository) private readonly _jobRepo: IJobRepository
    @inject(TYPES.ICountryRepository) private readonly _countryRepo: ICountryRepository
    @inject(TYPES.Token) private readonly _jwtToken: Token
    @inject(TYPES.ICityRepository) private readonly _cityRepo: ICityRepository
    @inject(TYPES.IFileRepository) private readonly _fileRepo: IFileRepository


    public async getAllCompany(): Promise<ReturnDtoCompany[]>{
        const listCompany = await this._companyRepo.getAll();
        const listCompanyReturn: ReturnDtoCompany[] = []
        for(let company of listCompany){
            if(company.status === 'available'){
                let tmp: ReturnDtoCompany = {
                    id: company._id,
                    name: company.company,
                    contact_name: company.contact_name,
                    phone: company.phone,
                    email: company.email
                }
                listCompanyReturn.push(tmp)
            }
        }
        return listCompanyReturn
    }

    public async createCompany(bearerToken: string, company: Company): Promise<{ id: string, message: string, status: number }>{
        const userData = this._jwtToken.getUserInfo(bearerToken)
        if(userData.permission.includes('company.all') || userData.permission.includes('company.create')){
            const employer = await this._userRepo.getById(userData.id)
            if(employer === null){
                return {id: '' ,message: 'The employer is not found', status : 1 }
            }
            if(employer.status !== 'approval'){
                return {id: '' ,message: 'The employer is not approval', status : 2 }
            }
            const industry = await this._industryRepo.getById(company.industry_id)
            if(industry === null){
                return {id: '' ,message: 'The industry is not found', status : 1 }
            }
            if(industry.status !== 'publish'){
                return {id: '' ,message: 'The industry is not available', status : 2 }
            }
           
            let postFunction: Function = null
            let job: Job = null
            if(company.function_id !== null){
                postFunction = await this._functionRepo.getById(company.function_id)
                if(postFunction === null){
                   return {id: '' ,message: 'The function is not found', status : 1 }   
                }else if (postFunction.status !== 'publish'){
                   return {id: '' ,message: 'The function is not available', status : 2 }
                }else if (postFunction.industry_id !== industry._id.toString()){
                   return {id: '' ,message: 'The function is not belong to '+industry.name +' industry', status : 3 }
                }
            }
            if(company.job_id !== null){
                job = await this._jobRepo.getById(company.job_id)
                if(job === null){
                   return {id: '' ,message: 'The job is not found', status : 1 }   
                }else if (job.status !== 'publish'){
                   return {id: '' ,message: 'The job is not available', status : 2 }
                }else  if(job.function_id !== postFunction._id.toString()){
                   return {id: '' ,message: 'The job is not belong to '+postFunction.name +' function', status : 3 }
                }else if (job.industry_id !== industry._id.toString()){
                   return {id: '' ,message: 'The job is not belong to '+industry.name +' industry', status : 3 }
                }
            }
            const country = await this._countryRepo.getById(company.country_id)
            if(country === null){
                return {id: '' ,message: 'The country is not found', status : 1 }
            }
            if(country.status !== 'publish'){
                return {id: '' ,message: 'The country is not available', status : 2 }
            }
            const city = await this._cityRepo.getById(company.city_id)
            if(city === null){
                return {id: '' ,message: 'The city is not found', status : 1 }
            }
            if(city.status !== 'publish'){
                return {id: '' ,message: 'The city is not available', status : 2 }
            }
            if(city.country_id !== country._id.toString()){
                return {id: '' ,message: 'The city is not belong to '+country.title +' country', status : 3 }
            }
            
            company.status = 'available'
            company.createdDate = new Date().getTime()
            const extname = path.extname(company.image_new_path)
            const filename = path.basename(company.image_new_path)
            let file = new File()
            file.path = Constants.pathImagesCompany +filename
            file.extension = extname.replace('.','')
            file.name = filename
            file.type = 'image'
            file.admin_id = userData.id
            file.user_id = null
            const resultCreateFile = await this._fileRepo.create(file)
            delete company.image_new_path
            company.image_file_id = resultCreateFile._id.toString()
            const result = await this._companyRepo.create(company)
            return {id: result._id.toString(),message: 'Success', status : 0 }
        }
        return {id: '' ,message: 'Permission is required', status : 4 }
    }

    public async updateCompany(bearerToken: string, companyId: string, updateCompany: Company): Promise<{ id: string, message: string, status: number }>{
        const employer = this._jwtToken.getUserInfo(bearerToken)
        if(employer.permission.includes('company.all') || employer.permission.includes('company.update')){
            const company =  await this._companyRepo.getById(companyId)
            if(company === null){
                return {id: '' ,message: 'The company is not found', status : 1 }
            }  
            if(company.status !== 'available'){
                return {id: '' ,message: 'The company is not available', status : 1 }
            }
            const industry = await this._industryRepo.getById(updateCompany.industry_id)
            if(industry === null){
                return {id: '' ,message: 'The industry is not found', status : 1 }
            }
            if(industry.status !== 'publish'){
                return {id: '' ,message: 'The industry is not available', status : 2 }
            }
            
            let postFunction: Function = null
            let job: Job = null
            if(updateCompany.function_id !== null){
                postFunction = await this._functionRepo.getById(updateCompany.function_id)
                if(postFunction === null){
                   return {id: '' ,message: 'The function is not found', status : 1 }   
                }else if (postFunction.status !== 'publish'){
                   return {id: '' ,message: 'The function is not available', status : 2 }
                }else if (postFunction.industry_id !== industry._id.toString()){
                   return {id: '' ,message: 'The function is not belong to '+industry.name +' industry', status : 3 }
                }
            }
            if(updateCompany.job_id !== null){
                job = await this._jobRepo.getById(updateCompany.job_id)
                if(job === null){
                   return {id: '' ,message: 'The job is not found', status : 1 }   
                }else if (job.status !== 'publish'){
                   return {id: '' ,message: 'The job is not available', status : 2 }
                }else  if(job.function_id !== postFunction._id.toString()){
                   return {id: '' ,message: 'The job is not belong to '+postFunction.name +' function', status : 3 }
                }else if (job.industry_id !== industry._id.toString()){
                    return {id: '' ,message: 'The job is not belong to '+industry.name +' industry', status : 3 }
                }
            }
            const country = await this._countryRepo.getById(updateCompany.country_id)
            if(country === null){
                return {id: '' ,message: 'The country is not found', status : 1 } 
            }
            if(country.status !== 'publish'){
                return {id: '' ,message: 'The country is not available', status : 2 }
            }
            const city = await this._cityRepo.getById(updateCompany.city_id)
            if(city === null){
                return {id: '' ,message: 'The city is not found', status : 1 }
            }
            if(city.status !== 'publish'){
                return {id: '' ,message: 'The city is not available', status : 2 }
            }
            if(city.country_id !== country._id.toString()){
                return {id: '' ,message: 'The city is not belong to '+country.title +' country', status : 3 }
            }
           
            const imageNewPath = updateCompany.image_new_path
            delete updateCompany.image_new_path
            const resultUpdate = await this._companyRepo.update(companyId,updateCompany)
            if(imageNewPath !== null){ // đổi ảnh 
                const fileImage = await this._fileRepo.getById(resultUpdate.image_file_id)
                if(fileImage !== null){
                    const extname = path.extname(imageNewPath)
                    const filename = path.basename(imageNewPath)
                    const filePath = Constants.pathImagesCompany + filename
                    const updateCompanyImageFile = {
                        admin_id: employer.id,
                        path: filePath,
                        name: filename,
                        extension: extname.replace('.','')
                    }
                    const oldPath = Constants.pathImagesCompany + fileImage.name
                    await this._fileRepo.update(resultUpdate.image_file_id, updateCompanyImageFile)
                    if(!oldPath.includes("default_company-image")){
                        fs.unlinkSync(oldPath)
                    }
                    return {id: resultUpdate._id.toString(),message: 'Success', status : 0 }
                }
                return {id: '',message: 'The image file id is not found', status : 1 }
            }
            return {id: resultUpdate._id.toString(),message: 'Success', status : 0 }
                            
                               
                        
            
        }
        return {id: '' ,message: 'Permission is required', status : 3 }
    }

    public async removeCompany(bearerToken: string, companyId: string): Promise<{ message: string, status: number }>{
        const employer = this._jwtToken.getUserInfo(bearerToken)
        if(employer.permission.includes('company.all') || employer.permission.includes('company.remove')){
            const company = await this._companyRepo.getById(companyId)
            if(company !== null){
                if(company.status === 'available'){
                    await this._companyRepo.update(companyId,{status: 'unavailable'})
                    return {message: 'Success', status : 0 }
                }
                return {message: 'The company is not available', status : 2 }
            }
            return {message: 'The company is not found', status : 1 }
            //error
        }
        return {message: 'Permission is required', status : 3 }
    }

    public async searchCompany(condition, pageIndex: number, pageSize: number, sortBy: number): Promise<{
        companies: any[],
        pageIndex: number,
        pageSize: number,
        totalPages: number,
        totalCount: number
    }>{
        let sort = {};
        const offset = pageIndex * pageSize
        if(sortBy === 0){
            sort['createdDate'] = -1
        }else if(sortBy === 1){
            sort['company'] = -1
        }
        if(condition.industry_id === '0'){
            delete condition.industry_id
        }

        condition.company = { $regex: condition.company, $options: 'i' }
        const result = await this._companyRepo.findByConditionAndPaging(condition, offset, pageSize, sort)
        const listCompany = result.data
        let listCompanyReturn = []
        for (let company of listCompany) {
            const industry = await this._industryRepo.getById(company.industry_id   )
            const dtoReturn = {
                id: company._id.toString(),
                name: company.company,
                industryId: industry._id.toString(),
                industry: industry.name,
                website: company.website,
                location: company.address,
                status: company.status
            }
            listCompanyReturn.push(dtoReturn)
        }
        const dtoReturn = {
            pageIndex,
            pageSize,
            totalPages: result.infoPaging.totalPages,
            totalCount: result.infoPaging.totalDocs,
            companies: listCompanyReturn
        }
        return dtoReturn
    }

    public async getDetailCompany(bearerToken: string,companyId: string): Promise<{data: {}, message: string, status: number}>{
        const employer = this._jwtToken.getUserInfo(bearerToken)
        if(employer.permission.includes('company.all') || employer.permission.includes('company.detail')){
            const company = await this._companyRepo.getById(companyId)
            if(company !== null){
                const indus = await this._industryRepo.getById(company.industry_id)
                const industry = {
                    id: indus._id.toString(),
                    name: indus.name
                }
                let companyFunction = null
                let job = null
                if(company.function_id !== null){
                    const companyFunc = await this._functionRepo.getById(company.function_id)
                    companyFunction = {
                        id: companyFunc._id.toString(),
                        name: companyFunc.name
                    }
                }
                if(company.job_id !== null){
                    const jobCompany = await this._jobRepo.getById(company.job_id)
                    job = {
                        id: jobCompany._id.toString(),
                        name: jobCompany.name
                    }
                }
                const fileImage = await this._fileRepo.getById(company.image_file_id)
                const country = await this._countryRepo.getById(company.country_id)
                const city = await this._cityRepo.getById(company.city_id)
                const companyReturn = {
                    id: company._id.toString(),
                    industry,
                    function: companyFunction,
                    job,
                    country: country.title,
                    city: {
                        id: city._id.toString(),
                        name: city.title
                    },
                    contact_name: company.contact_name,
                    email: company.email,
                    phone: company.phone,
                    company: company.company,
                    status: company.status,
                    createdDate : company.createdDate,
                    address: company.address,
                    website: company.website,
                    introduction: company.introduction,
                    image: '/static/company_images/'+fileImage.name
                }
                return {data: companyReturn, message: 'Success', status: 0}
            }
            return {data: {}, message: 'The company is not found', status: 1}
        }
        return {data: {}, message: 'Permission is required', status: 2}
    }
} 
