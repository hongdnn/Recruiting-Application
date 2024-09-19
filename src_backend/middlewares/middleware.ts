import { NextFunction, Request, Response } from 'express'
import * as jwt from 'jsonwebtoken'
import * as environment from '../environment'


// export const authenticate = (roles: string[])=>{
//     return function(req, res, next) {
//         let result = false
//         for(let role of roles){
//             if(role === 'collaborator' && !result){
//                 const bearerHeader = req.headers['authorization']
//                 if (typeof bearerHeader !== 'undefined') {
//                    const bearer = bearerHeader.split(' ')
//                    const bearerToken = bearer[1]
//                    jwt.verify(bearerToken, environment.Jwt.SecretKey, (err, authData) => {
//                        if (err) {
//                            result = false
//                        } else {
//                            result = true
//                        }
//                    })
//                }else{
//                     result = false
//                }
//             }else if (role === 'employer' && !result){
//                 if (req.session && req.session.employerData) {
//                     result = true
//                 } else {
//                     result = false
//                 } 
//             }
//         }
//         if(result){
//             next()
//         }else{
//             res.status(401).send('Unauthorized')
//         }
//     }

// }

export const authenticate = (req, res, next)=>{
    const bearerHeader = req.headers['authorization']
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ')
            // Get token from array
        const bearerToken = bearer[1]
            // Next middleware
        jwt.verify(bearerToken, environment.Jwt.SecretKey, (err, authData) => {
            if (err) {
                res.status(401).send('Unauthorized')
            } else {
                req.user = authData
                next()
                    // var c = jwt.decode(bearerToken); // { name: 'Nguyen Duc Hiep', iat: 1612684313, exp: 1612684343 }
                    // console.log(c);

            }
        })
    } else {
        res.sendStatus(401)
    }
} 


// function authenticate(req, res, next) {
    

// }

export const authorize = (roles: string[])=>{
    return function(req, res, next) {
        const user = req.user
        if (user && roles.includes(user.type_account)) {
            next()
        } else {
            res.status(403).send('Unauthorized')
        }
    }
}