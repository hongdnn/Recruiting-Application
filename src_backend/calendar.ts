import { google } from 'googleapis'
import uniqid from 'uniqid'
const { OAuth2 } = google.auth

const oAuth2Client = new OAuth2(
    '',
    ''
)

// Call the setCredentials method on our oAuth2Client instance and set our refresh token.
oAuth2Client.setCredentials({
    refresh_token: '',
})

const calendar = google.calendar({ version: 'v3', auth: oAuth2Client })

export function createCalendar(id: string, emails: string[], startDate: number, endDate: number, location: string, note: string, google_meet: boolean, isUpdate: boolean) {
    let attendees = []
    for (let email of emails) {
        attendees.push({ email: email })
    }
    const eventStartTime = new Date(startDate)
    eventStartTime.setHours(eventStartTime.getHours() + 7)
    const startTime = eventStartTime.toISOString().split('.')[0]

    const eventEndTime = new Date(endDate)
    eventEndTime.setHours(eventEndTime.getHours() + 7)
    const endTime = eventEndTime.toISOString().split('.')[0]
    const meet_id = uniqid(`${id}-`)
    const event = {
        summary: `Mời Phỏng vấn thử tại tatool.vn`,
        location: location,
        description: note,
        start: {
            dateTime: startTime,
            timeZone: 'Asia/Ho_Chi_Minh',
        },
        end: {
            dateTime: endTime,
            timeZone: 'Asia/Ho_Chi_Minh',
        },
        attendees: attendees,
    }
    if (google_meet === true) {
        event['conferenceData'] = {
            createRequest: {
                conferenceSolutionKey: {
                    type: "hangoutsMeet"
                },
                requestId: meet_id
            }
        }
    }
    if (isUpdate) {
        calendar.events.update({
            calendarId: 'primary',
            eventId: id,
            requestBody: event,
            sendUpdates: 'all',
            conferenceDataVersion : 1
        }, function (err, event) {
            if (err) {
                console.log('There was an error contacting the Calendar service: ' + err);
                return
            }
            console.log(`Calendar event updated`)
        });
    } else {
        event['id'] = id
        calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
            sendUpdates: 'all',
            conferenceDataVersion : 1
        }, function (err, event) {
            if (err) {
                console.log('There was an error contacting the Calendar service: ' + err);
                return
            }
            console.log(`Calendar event created`)
        });
    }
}

export function deleteCalendar(id: string) {
    calendar.events.delete({
        calendarId: 'primary',
        eventId: id,
        sendUpdates: 'all',
    }, function (err, event) {
        if (err) {
            console.log('There was an error contacting the Calendar service: ' + err);
            return
        }
        console.log(`Calendar event deleted`)
    });
}


