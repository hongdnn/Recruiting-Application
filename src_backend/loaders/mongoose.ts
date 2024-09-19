import mongoose = require("mongoose")
import { mongoUri } from '../environment'


export class Database {
  constructor() {

  }

  public async connectDatabase() {
    return await  mongoose.connect(mongoUri, {
       useNewUrlParser: true,
       useCreateIndex: true,
       useUnifiedTopology: true,
       useFindAndModify: false
     })
     // mongoose.connect(mongoUri, {
     //   useNewUrlParser: true,
     //   useCreateIndex: true,
     //   useUnifiedTopology: true,
     //   useFindAndModify: false
     // }).then(()=> {
     //     console.log('MongoDB Initialized');
     // }).catch((err) => console.log(err))
   }
}
