import { inject, injectable } from "inversify";
import { ReturnSkillDto } from "../../entities/skill";
import { ISkillRepository } from "../../repositories/skill.repository";
import { TYPES } from "../../types";

export interface ISkillService{
    getAllSkill(): Promise<ReturnSkillDto[]>
}
    

@injectable()
export class SkillService implements ISkillService {
    @inject(TYPES.ISkillRepository) private readonly _skillRepo: ISkillRepository

    public async getAllSkill(): Promise<ReturnSkillDto[]>{
        let listSkill = await this._skillRepo.getAll();
        const listSkillReturn: ReturnSkillDto[] = []; 
        for(let skill of listSkill){
            let tmp: ReturnSkillDto = {
                _id: skill._id,
                name: skill.name
            }
            listSkillReturn.push(tmp)
        }
        return listSkillReturn
    }
   
} 