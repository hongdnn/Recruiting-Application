import axios from 'axios'
import { injectable } from 'inversify';

@injectable()
export class InviteTestService {

    constructor() {

    }

    public async getQuestionPackageIds(): Promise<string[]> {
        let result = []
        const headers = {
            'Authorization': `Bearer ${process.env.TATOOL_TOKEN}`,
            'Content-Type': 'application/json'
        }
        const body = {
            action: "read",
            language: "vi",
            data: {
                selects: ["question_packages", "times", "remain"]
            }
        }
        try {
            const response = await axios.post('https://api.tatool.vn/v3/user-service', body, { headers })
            if (response.data.code === 0) {
                for (let service of response.data.data.data) {
                    if (service.remain > 0 && service.question_packages !== undefined) {                       
                        result.push(service)
                    }
                }
                return result
            }
        } catch (error) {
            console.log(error)
            return []
        }
    }


    public async getQuestionPackages(packageIds: string[]): Promise<string[]> {
        const headers = {
            'Authorization': `Bearer ${process.env.TATOOL_TOKEN}`,
            'Content-Type': 'application/json'
        }
        const body = {
            action: "read",
            language: "vi",
            data: {
                selects: ["name", "type_test"],
                whereIn: [
                    {
                        field: "_id",
                        value: packageIds
                    }
                ]
            }
        }
        try {
            const response = await axios.post('https://api.tatool.vn/v3/question-package', body, { headers })
            if (response.data.code === 0) {
                return response.data.data.data
            }
        } catch (error) {
            console.log(error)
            return []
        }
    }


    public async inviteTest(question_package: any, email_member_id: string, invited_at: number,
        expired: number, user_id: string,): Promise<{ data: any, message: string, status: number }> {
        const headers = {
            'Authorization': `Bearer ${process.env.TATOOL_TOKEN}`,
            'Content-Type': 'application/json'
        }
        const body = {
            action: "create",
            language: "vi",
            data: {
                download_report: true,
                duration: 365,
                email_member_id: email_member_id,
                expired: expired,
                invited_at: invited_at,
                lang: "vi",
                language_test: "vi",
                level: 1,
                name: question_package.name,
                question_package_ids: [question_package._id],
                remain: 1,
                times: 1,
                times_test: 10,
                type_service: "psychometric",
                user_id: user_id,
                user_invite_id: user_id,
                user_service_id: question_package.service_id,
                view_answer: true,
                view_report: true
            }
        }
        try {
            const response = await axios.post('https://api.tatool.vn/v3/invite-test', body, { headers })
            if (response.data.code === 0) {
                return { data: response.data.data, message: 'Invite success', status: 0 }
            }
            return { data: null, message: 'Invite failed', status: 1 }
        } catch (error) {
            console.log(error)
            return { data: null, message: 'Invite failed', status: 1 }
        }
    }


    public async getEmailMemberId(email: string): Promise<string> {
        const headers = {
            'Authorization': `Bearer ${process.env.TATOOL_TOKEN}`,
            'Content-Type': 'application/json'
        }
        const body = {
            action: "read",
            language: "vi",
            data: {
                selects: ["email"],
                where: [
                    {
                        field: "email",
                        value: email
                    }
                ]
            }
        }
        try {
            const response = await axios.post('https://api.tatool.vn/v3/email-member', body, { headers })
            if (response.data.data.length > 0) {
                return response.data.data[0]._id
            }
            return ''
        } catch (error) {
            console.log(error)
            return null
        }
    }

    public async createEmailMember(email: string): Promise<string> {
        const headers = {
            'Authorization': `Bearer ${process.env.TATOOL_TOKEN}`,
            'Content-Type': 'application/json'
        }
        const body = {
            action: "create",
            language: "vi",
            data: {
                email: email,
                group_member_id: "6061417b8643a715e77ce162"
            }
        }
        try {
            const response = await axios.post('https://api.tatool.vn/v3/email-member', body, { headers })
            return response.data.data._id
        } catch (error) {
            console.log(error)
            return null
        }
    }

    public async getTestReport(invite_test_id: string): Promise<any> {
        const headers = {
            'Authorization': `Bearer ${process.env.TATOOL_TOKEN}`,
            'Content-Type': 'application/json'
        }
        const body = {
            action: "read",
            language: "vi",
            data: {
                selects: ["invite_test_id", "scores", "percents", "email"],
                where: [
                    {
                        field: "invite_test_id",
                        value: invite_test_id
                    }
                ]
            }
        }
        try {
            const response = await axios.post('https://api.tatool.vn/v3/report', body, { headers })
            if(response.data.code === 0){
                return response.data.data
            }
            return null
        } catch (error) {
            console.log(error)
            return null
        }
    }
}
