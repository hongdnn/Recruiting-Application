import { inject, injectable } from "inversify";
import { BankAccount } from "../../entities/bank_account";
import { IBankAccountRepository } from "../../repositories/bank_account.repository";
import { IUserRepository } from "../../repositories/user.repository";
import { TYPES } from "../../types";
import fs from 'fs'
import { IFileRepository } from "../../repositories/file.repository";
import { Constants } from "../../common/constants";


export interface IBankAccountService {
    updateBankAccount(updateFields: {}): Promise<{ bankAccount: {}, status: number, message: string }>
}



@injectable()
export class BankAccountService implements IBankAccountService {
    @inject(TYPES.IBankAccountRepository) private readonly _bankAccountRepo: IBankAccountRepository
    @inject(TYPES.IUserRepository) private readonly _userRepo: IUserRepository
    @inject(TYPES.IFileRepository) private readonly _fileRepo: IFileRepository

    // public async createBankAccount(bankAccount: BankAccount): Promise<{bankAccount: {}, status: number, message: string}> {
    //     console.log(bankAccount.id_card_date);
    //    console.log(moment(bankAccount.id_card_date,"YYYY-MM-DD").isValid());


    //     let date = new Date(bankAccount.id_card_date)
    //     bankAccount.id_card_date = date.getTime()
    //     console.log(bankAccount.id_card_date);

    //     const checkUser = await this._userRepo.getById(bankAccount.account_username);        
    //     if(checkUser !== null){
    //         if(checkUser.bank_id === null){
    //             const result = await this._bankAccountRepo.create(bankAccount)                
    //             await this._userRepo.update(bankAccount.account_username,{bank_id: result._id})
    //             return {bankAccount: result, status: 0, message: 'Success'};
    //         }
    //         return {bankAccount: {}, status: 1, message: 'This user had already bank account.'};
    //     }
    //     return {bankAccount: {}, status: 2, message: 'This user account is not exsited.'}; 
    //  }  

    public async updateBankAccount(updateFields: {}): Promise<{ bankAccount: {}, status: number, message: string }> {
        const bankAcc = new BankAccount(updateFields)
        const checkUser = await this._userRepo.getById(bankAcc.account_username);
        if (checkUser !== null) {
            let imagePath = {}
            if (updateFields['front_side_image'] !== undefined) {
                let path = updateFields['front_side_image'].replace('/static', './assets')
                if (!fs.existsSync(path)) {
                    return { bankAccount: {}, message: 'Front side image not found', status: 1 }
                } else {
                    imagePath['front_side_image'] = updateFields['front_side_image']
                }
                delete updateFields['front_side_image']
            }
            if (updateFields['back_side_image'] !== undefined) {
                let path = updateFields['back_side_image'].replace('/static', './assets')
                if (!fs.existsSync(path)) {
                    return { bankAccount: {}, message: 'Back side image not found', status: 1 }
                } else {
                    imagePath['back_side_image'] = updateFields['back_side_image']
                }
                delete updateFields['back_side_image']
            }
            if (Object.keys(imagePath).length > 0) {
                for (const [key, value] of Object.entries(imagePath)) {
                    const ext = value.toString().split('.')[2]
                    const name = value.toString().split('/')[3]
                    const path = Constants.pathImagesBank + name
                    const fileDto: any = {
                        type: 'image',
                        name: name,
                        extension: ext,
                        path: path,
                        admin_id: null,
                        user_id: bankAcc.account_username
                    }
                    const uploadResult = await this._fileRepo.create(fileDto)
                    if (key.toString() === 'front_side_image') {
                        updateFields['front_side_image_id'] = uploadResult._id.toString()
                        bankAcc.front_side_image_id = uploadResult._id.toString()
                    } else {
                        updateFields['back_side_image_id'] = uploadResult._id.toString()
                        bankAcc.back_side_image_id = uploadResult._id.toString()
                    }
                }
            }
            if (checkUser.bank_id === null) {
                const result = await this._bankAccountRepo.create(bankAcc)
                await this._userRepo.update(bankAcc.account_username, { bank_id: result._id })
                return { bankAccount: result, status: 0, message: 'Create bank account success' };
            } else {
                const result = await this._bankAccountRepo.update(checkUser.bank_id, updateFields);
                return { bankAccount: result, status: 0, message: 'Update bank account success' };
            }

        }
        return { bankAccount: {}, status: 1, message: 'This user account is not exsited.' };


    }
}