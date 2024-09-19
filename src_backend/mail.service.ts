import axios from 'axios'
import { injectable } from 'inversify';

@injectable()
export class MailService{

    constructor(){
        
    }

    public async sendMail(from: string, to: string, cc: string[], subject: string, content: string, fullname: string): Promise<boolean>{
        const tatoolToken = process.env.TATOOL_TOKEN
        const headers = {
            'Authorization': 'Bearer '+tatoolToken,
            'Content-Type': 'application/json'
        }    
        const time_send =Math.floor(new Date().getTime()/1000)     
        const body = {
            action: "create",
            language: "vi",
            data: {
              subject: subject,
              from: from,
              to: to,
              cc: cc,
              bcc: [],
              content: content,
              information: {
                full_name: fullname
              },
              view: "",
              type: "noreply",
              group: "",
              lang: "vi",
              time_send_email: time_send,
              sending: 0,
              message_id: "",
              campaign: "",
              config_set_name: "",
              tracking: true
            }
        }
        try {
            const response = await axios.post('https://v3/email-crond',body, {headers})
            if(response.data.code === 0){
                return true;
            }
        } catch (error) {            
            return false
        }        
    }

    

}
