import { inject, injectable } from "inversify";
import { ReturnCityDto } from "../../entities/city";
import { ICityRepository } from "../../repositories/city.repository";
import { TYPES } from "../../types";

export interface ICityService{
    getAllCities(): Promise<ReturnCityDto[]>
}
    

@injectable()
export class CityService implements ICityService {
    @inject(TYPES.ICityRepository) private readonly _cityRepo: ICityRepository

    public async getAllCities(): Promise<ReturnCityDto[]>{
        const listCity = await this._cityRepo.getAll();
        const listCityReturn: ReturnCityDto[] = []; 
        for(let city of listCity){
            if(city.status === 'publish'){
                let tmp: ReturnCityDto = {
                    id: city._id,
                    name: city.title
                }
                if(city.title === 'Hà Nội' || city.title === 'Hồ Chí Minh'){
                    listCityReturn.unshift(tmp)
                }else{
                    listCityReturn.push(tmp)
                }
            }
        }
        return listCityReturn
    }
} 