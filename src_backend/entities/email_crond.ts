//Định nghĩa shema và truy vấn đến database
import { model, Document, Schema } from 'mongoose'

const emailCrondSchema = new Schema({
    view: {
        type: String,
        require: true
    },
    subject: {
        type: String,
        require: true
    },
    from: {
        type: String,
        require: true
    },
    to: {
        type: String,
        require: true
    },
    cc: {
        type: Array,
        default: []
    },
    bcc: {
        type: Array,
        default: []
    },
    time_stamp: {
        type: Date,
        require: true
    },
    information: {
        type: Array,
        require: true
    },
    type: {
        type: String,
        require: true
    },
    group: {
        type: String,
        require: true
    },
    lang: {
        type: String,
        require: true
    },
    time_send_email: {
        type: Date,
        require: true
    },
    sending: {
        type: Number,
        require: true
    },
    message_id: {
        type: String,
        require: true
    },
    content: {
        type: String,
        require: true
    },
    tracking: {
        type: Boolean,
        require: true
    },
    send: {
        type: Array,
        require: true
    },
    open: {
        type: Array,
        require: true
    },
    click: {
        type: Array,
        require: true
    }
})

export class EmailCrond {
    view: String;
    subject: String;
    from: String;
    to: String;
    cc: Array<String>;
    bcc: Array<String>;
    time_stamp: Date;
    information: Array<String>;
    type: String;
    group: String;
    lang: Array<String>;
    time_send_email: Date;
    sending: Number;
    message_id: String;
    content: String;
    tracking: Boolean;
    send: Array<String>;
    open: Array<String>;
    click: Array<String>;
}

export const EmailCrondModel = model<Document<EmailCrond>>('email_crond', emailCrondSchema)