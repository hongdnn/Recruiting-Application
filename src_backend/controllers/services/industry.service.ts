import { inject, injectable } from "inversify";
import { IndustryReturnDto } from "../../entities/industry";
import { IFunctionRepository } from "../../repositories/function.repository";
import { IIndustryRepository } from "../../repositories/industry.repository";
import { IJobRepository } from "../../repositories/job.repository";
import { IJobRoleRepository } from "../../repositories/job_role.repository";
import { TYPES } from "../../types";

export interface IIndustryService{
    getIndustries(): Promise<IndustryReturnDto[]>
    getListIndustries(): Promise<any[]> //industries,functions,jobs
}
@injectable()
export class IndustryService implements IIndustryService{
    @inject(TYPES.IIndustryRepository) private readonly _industryRepo: IIndustryRepository
    @inject(TYPES.IFunctionRepository) private readonly _functionRepo: IFunctionRepository
    @inject(TYPES.IJobRepository) private readonly _jobRepo: IJobRepository
    @inject(TYPES.IJobRoleRepository) private readonly _jobRoleRepo: IJobRoleRepository

    public async getIndustries(): Promise<IndustryReturnDto[]> {
        const listIndustry = await this._industryRepo.getAll()
        const listIndustryReturnDto: IndustryReturnDto[] = []
        for(let industry of listIndustry){
            if(industry.status === 'publish'){
                let tmp: IndustryReturnDto = {
                    id: industry._id,
                    name: industry.translate['vi'].name,
                    translate: industry.translate['en'].name
                }
                listIndustryReturnDto.push(tmp)
            }
        }
        return listIndustryReturnDto
    }

    public async getListIndustries(): Promise<any[]> {
        const listIndustry = await this._industryRepo.getAll()
        let listIndustryReturnDto = []
        for(let industry of listIndustry){
            if(industry.status === 'publish'){
                let tmp = {
                    id: industry._id,
                    name: industry.name,
                    translate: industry.translate
                }
                const listFunction = await this._functionRepo.getFunctionsByIndustry(industry._id)
                for(let functionDto of listFunction){
                    const jobs = await this._jobRepo.getJobsByFunction(functionDto.id)
                    const jobRoles = await this._jobRoleRepo.findByCondition({function_id: functionDto.id, status: 'publish'})
                    functionDto['jobs'] = jobs
                    functionDto['jobRoles'] = jobRoles
                }
                tmp['functions'] = listFunction
                listIndustryReturnDto.push(tmp)
            }
        }
        return listIndustryReturnDto
    }
}