import { injectable } from "inversify";
import {PaginateModel, Document} from "mongoose";
import { BankAccount } from "../entities/bank_account";
import { BaseRepository,IBaseRepository } from "./base.repository";

export interface IBankAccountRepository extends IBaseRepository<BankAccount>{

}

@injectable()
export class BankAccountRepository extends BaseRepository<BankAccount> implements IBankAccountRepository{

    constructor(mongooseModel: PaginateModel<Document<BankAccount>>){
        super(mongooseModel)
    }
    
}