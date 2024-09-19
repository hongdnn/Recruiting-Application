 import * as dotenv from 'dotenv'

 dotenv.config({ path: `.env` })

const mongoUri = process.env.MONGO_UR
const PORT = process.env.PORT_BACKEND || 3000
const Jwt = {
    SecretKey: process.env.TATOOL_JWT_TOKEN,
    ExpiryTimeInMinutes: 43200,
    ValidIssuer: "tatool.co",
    ValidAudience: "tatool"
}
const Bcrypt = {
    SaltRound: 10
}

export {
    mongoUri, PORT, Jwt, Bcrypt
}