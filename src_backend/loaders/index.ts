import { Database } from './mongoose'
import {ExpressLoader} from './express'
//import difflib from 'difflib'
//import natural from 'natural'

declare module 'mongoose' {
    interface CollationOptions {
        locale: string,
        caseLevel: boolean,
        caseFirst: string,
        strength: number,
        numericOrdering: boolean,
        alternate: string,
        maxVariable: string,
        backwards: boolean
    }

    interface QueryFindOptions{
        
    }
}

export const loader = async({ expressApp }) => {
    const db = new Database()
    try{
        await db.connectDatabase()
        console.log('MongoDB Initialized')
    }catch(error){
        console.log(error)
        console.log('Connect database failed.');
    }
    // console.log(natural.JaroWinklerDistance('GGGG','GG'))
    // const s = new difflib.SequenceMatcher(null, 'Nguyen Duc Hiep kooka', 'Nguyen Duc Hiep koko')
    // console.log(s.ratio())
    const el = new ExpressLoader()
    el.configExpress(expressApp)
    console.log('Express Initialized')
}
