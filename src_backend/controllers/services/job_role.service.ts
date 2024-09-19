import { inject, injectable } from "inversify";
import { ReturnJobRoleDto } from "../../entities/job_role";
import { IJobRoleRepository } from "../../repositories/job_role.repository";
import { TYPES } from "../../types";

export interface IJobRoleService{
    getAllJobRole(): Promise<ReturnJobRoleDto[]>
    getJobRolesByFunction(functionId: string): Promise<ReturnJobRoleDto[]>
}
    

@injectable()
export class JobRoleService implements IJobRoleService {
    @inject(TYPES.IJobRoleRepository) private readonly _jobRoleRepo: IJobRoleRepository

    public async getAllJobRole(): Promise<ReturnJobRoleDto[]>{
        const listJobRole = await this._jobRoleRepo.getAll();
        const listJobRoleReturn: ReturnJobRoleDto[] = []; 
        for(let jobRole of listJobRole){
            if(jobRole.status === "publish"){
                const checkName = listJobRoleReturn.find(j => j.name === jobRole.name)
                if(checkName === undefined){
                    let tmp: ReturnJobRoleDto = {
                        _id: jobRole._id,
                        name: jobRole.name
                    }
                    listJobRoleReturn.push(tmp)
                }
            }
        }
        return listJobRoleReturn
    }
    
    public async getJobRolesByFunction(functionId: string): Promise<ReturnJobRoleDto[]>{
        const listJobRole = await this._jobRoleRepo.findByCondition({function_id: functionId, status: 'publish'});
        const listJobRoleReturn: ReturnJobRoleDto[] = []; 
        for(let jobRole of listJobRole){
            let tmp: ReturnJobRoleDto = {
                _id: jobRole._id,
                name: jobRole.name
            }
            listJobRoleReturn.push(tmp)
        }
        return listJobRoleReturn
    }
} 