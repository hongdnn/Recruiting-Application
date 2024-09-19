import { inject, injectable } from "inversify";
import { JobReturnDto } from "../../entities/job";
import { IJobRepository } from "../../repositories/job.repository";
import { TYPES } from "../../types";

export interface IJobService{
    getJobs(): Promise<JobReturnDto[]>
    getJobsByFunction(functionId: string): Promise<JobReturnDto[]>
}
@injectable()
export class JobService implements IJobService{
    @inject(TYPES.IJobRepository) private readonly _jobRepo: IJobRepository

    public async getJobs(): Promise<JobReturnDto[]> {
        const listJob = await this._jobRepo.getAll()
        const listJobReturnDto: JobReturnDto[] = []
        for(let job of listJob){
            if(job.status === 'publish'){
                let tmp: JobReturnDto = {
                    id: job._id,
                    name: job.name,
                    translate: job.translate
                }
                listJobReturnDto.push(tmp)
            }
        }
        return listJobReturnDto
    }

    public async getJobsByFunction(functionId: string): Promise<JobReturnDto[]> {
        const listJob = await this._jobRepo.findByCondition({function_id: functionId, status: 'publish'})
        const listJobReturnDto: JobReturnDto[] = []
        for(let job of listJob){
            let tmp: JobReturnDto = {
                id: job._id,
                name: job.name,
                translate: job.translate
            }
            listJobReturnDto.push(tmp)
        }
        return listJobReturnDto
    }
}