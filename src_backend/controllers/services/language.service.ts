import { inject, injectable } from "inversify";
import { ReturnLanguageDto } from "../../entities/language";
import { ILanguageRepository } from "../../repositories/language.repository";
import { TYPES } from "../../types";

export interface ILanguageService{
    getAllLanguage(): Promise<ReturnLanguageDto[]>
}
    

@injectable()
export class LanguageService implements ILanguageService {
    @inject(TYPES.ILanguageRepository) private readonly _languageRepo: ILanguageRepository

    public async getAllLanguage(): Promise<ReturnLanguageDto[]>{
        const listLanguage = await this._languageRepo.getAll();
        const listLanguageReturn: ReturnLanguageDto[] = []; 
        for(let language of listLanguage){
            let tmp: ReturnLanguageDto = {
                _id: language._id,
                name: language.name
            }
            listLanguageReturn.push(tmp)
        }
        return listLanguageReturn
    }
   
} 