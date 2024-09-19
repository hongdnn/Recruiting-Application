import StreamZip from 'node-stream-zip'
import archiver from 'archiver'
import fs from 'fs'
import path from 'path'
import { injectable } from 'inversify';
import AdmZip from 'adm-zip'
import { DOMParser } from 'xmldom'
import { Constants } from '../common/constants'
import { convert } from 'html-to-text';

export interface IHtmlHandler{
    extractText(filePath): string
    hideUserInfoInHtml(htmlPath: string,candidateExsited: boolean): {message: string, status: number, pathOriginal: string, pathHided: string, email: string, phone: string}
}

@injectable()
export class HtmlHandler implements IHtmlHandler{
    regexPhone: RegExp = /[(]?[+]?(0|\84)[)]?(\s|\.)?((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))(\d)(\s|\.)?(\d{3})(\s|\.)?(\d{3})/g;
    regexFacebook:RegExp = /https?:\/\/[\w]+\.?(facebook|fb)\.com\/[a-zA-Z0-9_.?=]*/g
    regexLinkedln: RegExp = /https?:\/\/[\w]+\.?linkedin\.com\/in\/[A-z0-9_-]+\/?/g
    regexEmail: RegExp = /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/g


    public extractText(filePath): string{
        const html = fs.readFileSync(filePath,'utf-8')
        const text = convert(html, {baseElements: { selectors: [ 'body' ] }})
        return text
    }

    public hideUserInfoInHtml(htmlPath: string , candidateExsited: boolean): {message: string, status: number, pathOriginal: string, pathHided: string, email: string, phone: string}{
        try {
            const filename = path.basename(htmlPath, path.extname(htmlPath))
            let content = fs.readFileSync(htmlPath,'utf-8')
            let pathHided = Constants.pathTmpFixedCv + filename + '.html'
            if(candidateExsited){
                pathHided = Constants.pathFixedCv+ filename + '.html'
            }
            let email = ''
            let phone = ''
            let listEmail = content.match(this.regexEmail)
            let listPhone = content.match(this.regexPhone)
            content = content.replace(this.regexEmail,'**********').replace(this.regexPhone,'***********').replace(this.regexLinkedln,'***********').replace(this.regexFacebook,'***********')
            
            if(listEmail !== null){
                email = listEmail[0]
            }
            if(listPhone !== null){
                phone = listPhone[0]
            }
            
            fs.writeFileSync(pathHided, content)
            return {message: 'Success', status: 0, pathOriginal: htmlPath, pathHided, email, phone}
        } catch (error) {
            return {message: ''+error, status: 1, pathOriginal: '', pathHided: '', email: '', phone: ''}
        }
    }

    

    
}