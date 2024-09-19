import { injectable } from 'inversify'
import { Model, Document, PaginateModel } from 'mongoose';
import { BaseRepository, IBaseRepository } from './base.repository';
import { InterviewScheduleQuestion } from '../entities/interview_schedule_question';

export interface IInterviewScheduleQuestionRepository extends IBaseRepository<InterviewScheduleQuestion> {
}

@injectable()
export class InterviewScheduleQuestionRepository extends BaseRepository<InterviewScheduleQuestion> implements IInterviewScheduleQuestionRepository {
    constructor(mongooseModel: PaginateModel<Document<InterviewScheduleQuestion>>) {
        super(mongooseModel)
    }
}
