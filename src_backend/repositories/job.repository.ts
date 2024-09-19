import { injectable } from 'inversify'
import { Model, Document, PaginateModel } from 'mongoose';
import { BaseRepository, IBaseRepository } from './base.repository';
import { Job, JobReturnDto } from '../entities/job';

export interface IJobRepository extends IBaseRepository<Job> {
    getJobsByFunction(functionId: string): Promise<JobReturnDto[]>
}

@injectable()
export class JobRepository extends BaseRepository<Job> implements IJobRepository {
    constructor(mongooseModel: PaginateModel<Document<Job>>) {
        super(mongooseModel)
    }

    public async getJobsByFunction(functionId: string): Promise<JobReturnDto[]> {
        const jobs = await this._mongooseModel.find({function_id: functionId})
        let listJob: Job[] = []
        jobs.map(e => listJob.push(e.toObject<Job>()))
        let result: JobReturnDto[] = []
        for(let job of listJob){
            if(job.status === 'publish'){
                let tmp: JobReturnDto = {
                    id: job._id,
                    name: job.name,
                    translate: job.translate
                }
                result.push(tmp)
            }
        }
        return result
    }
}
