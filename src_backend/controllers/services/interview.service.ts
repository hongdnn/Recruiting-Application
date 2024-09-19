import { inject, injectable } from "inversify";
import { IInterviewRepository } from "../../repositories/interview.repository";
import { TYPES } from "../../types";

export interface IInterviewService {
}

@injectable()
export class InterviewService implements IInterviewService {
    @inject(TYPES.IInterviewRepository) private readonly _interviewRepo: IInterviewRepository

}