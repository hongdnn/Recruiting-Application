import * as admin from 'firebase-admin'
import path from 'path'

const firebasePath = path.resolve(process.cwd(), 'ta-tatool-firebase-adminsdk-wfm0b-d3a6f15e36.json')
var serviceAccount = require(firebasePath)

export function initFirebase() {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    })
}

export function sendNotification(fcmToken: string, data: {}) {
    const message = {
        data: data,
        token: fcmToken
    }

    admin.messaging().send(message)
        .then((response) => {
        })
        .catch((error) => {
            console.log('Error sending message firebase')
        })

}


