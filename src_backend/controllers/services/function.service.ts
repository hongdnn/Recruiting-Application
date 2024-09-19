import { inject, injectable } from "inversify";
import { FunctionReturnDto } from "../../entities/function";
import { IFunctionRepository } from "../../repositories/function.repository";
import { TYPES } from "../../types";

export interface IFunctionService{
    getFunctions(): Promise<FunctionReturnDto[]>
    getFunctionsByIndustry(industryId: string): Promise<FunctionReturnDto[]>
}
@injectable()
export class FunctionService implements IFunctionService{
    @inject(TYPES.IFunctionRepository) private readonly _functionRepo: IFunctionRepository

    public async getFunctions(): Promise<FunctionReturnDto[]> {
        const listFunction = await this._functionRepo.getAll()
        const listFunctionReturnDto: FunctionReturnDto[] = []
        for(let func of listFunction){
            if(func.status === 'publish'){
                let tmp: FunctionReturnDto = {
                    id: func._id,
                    name: func.name,
                    translate: func.translate
                }
                listFunctionReturnDto.push(tmp)
            }
        }
        return listFunctionReturnDto
    }

    public async getFunctionsByIndustry(industryId: string): Promise<FunctionReturnDto[]> {
        const listFunction = await this._functionRepo.findByCondition({industry_id: industryId, status: 'publish'})
        const listFunctionReturnDto: FunctionReturnDto[] = []
        for(let func of listFunction){
            let tmp: FunctionReturnDto = {
                id: func._id,
                name: func.name,
                translate: func.translate
            }
            listFunctionReturnDto.push(tmp)
        }
        return listFunctionReturnDto
    }
}