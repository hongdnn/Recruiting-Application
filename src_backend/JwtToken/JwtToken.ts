import 'reflect-metadata'
import jwt from 'jsonwebtoken'
import { injectable } from 'inversify';
import {Jwt} from '../environment'

@injectable()
export class Token{

    constructor(){
        
    }

    public generateToken(email, fullname, typeAccount, id, permission, status): Promise<string> {
        return new Promise((resolve, reject) => {
            if(permission.length !== 0){
                jwt.sign({ name: fullname, email, type_account: typeAccount,id, iss: Jwt.ValidIssuer, aud: Jwt.ValidAudience, permission, status },
                    Jwt.SecretKey, { expiresIn: 60 * Jwt.ExpiryTimeInMinutes },
                    (err, token) => {
                        if (err) {
                            reject(err)
                        }
                        resolve(token)
                    }
                )
            }
            jwt.sign({ name: fullname, email, type_account: typeAccount,id, iss: Jwt.ValidIssuer, aud: Jwt.ValidAudience },
                Jwt.SecretKey, { expiresIn: 60 * Jwt.ExpiryTimeInMinutes },
                (err, token) => {
                    if (err) {
                        reject(err)
                    }
                    resolve(token)
                }
            )
        })
    }

    public getUserInfo(bearerToken: string){
        let realToken = bearerToken.split(" ")[1];        
        let userInfo = jwt.decode(realToken)
        return userInfo
    }
}