import StreamZip from 'node-stream-zip'
import archiver from 'archiver'
import fs from 'fs'
import path from 'path'
import { injectable } from 'inversify';
import AdmZip from 'adm-zip'
import { DOMParser } from 'xmldom'
import { Constants } from '../common/constants'

export interface IDocxHandler{
    hidehtml(htmlPath: string): {message: string, status: number, pathOriginal: string, pathHided: string}
    extractText(filePath): Promise<{content: string, status: number, message: string}>
    hideUserInfoInDocx(docxPath: string,candidateExsited: boolean): {message: string, status: number, pathOriginal: string, pathHided: string, email: string, phone: string}
}

@injectable()
export class DocxHandler implements IDocxHandler{
    regexPhone: RegExp = /[(]?[+]?(0|\84)[)]?(\s|\.)?((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))(\d)(\s|\.)?(\d{3})(\s|\.)?(\d{3})/g;
    regexFacebook:RegExp = /https?:\/\/[\w]+\.?(facebook|fb)\.com\/[a-zA-Z0-9_.?=]*/g
    regexLinkedln: RegExp = /https?:\/\/[\w]+\.?linkedin\.com\/in\/[A-z0-9_-]+\/?/g
    regexEmail: RegExp = /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/g


    private readContentInDocx2(filePath): Promise<string>{
        return new Promise(
            function(resolve, reject) {
                const zip = new StreamZip({
                    file: filePath,
                    storeEntries: true
                })

                zip.on('ready', () => {
                    var chunks = []
                    var content = null
                    zip.stream('word/document.xml', (err, stream) => {
                        if (err) {
                            reject(err)
                        }
                        stream.on('data', function(chunk) {
                            chunks.push(chunk)
                        })
                        stream.on('end', function() {
                            content = Buffer.concat(chunks)
                            zip.close()
                            resolve(content.toString())
                        })
                    })
                })
            }
        )
    }

    public extractText(filePath): Promise<{content: string, status: number, message: string}>{
        return new Promise((resolve, reject)=>{
           this.readContentInDocx2(filePath).then((res)=>{
                let body = ''
                let components = res.toString().split('<w:t')
                let listConent: string[] = []
                for(var i=0;i<components.length;i++) {
                    var tags = components[i].split('>')
                    var content = tags[1].replace(/<.*$/,"")
                    if(!listConent.includes(content)){
                        body += content+' '
                    }
                   // body += content+' '
                    listConent.push(content)
                }
                resolve({content: body, status: 0, message: 'Success'})
           }).catch((err)=>{
                reject({content: '', status: 3, message: ''+err})
           });
        })
    }

    public hideUserInfoInDocx(docxPath: string,candidateExsited: boolean): {message: string, status: number, pathOriginal: string, pathHided: string, email: string, phone: string}{
        try {
            let email = ''
            let phone = ''
            const filename = path.basename(docxPath, path.extname(docxPath))
            let pathHided = Constants.pathTmpFixedCv + filename + '.docx'
            if(candidateExsited){
                pathHided = Constants.pathFixedCv+ filename + '.docx'
            }
            const newPath = docxPath+'.zip'
            fs.renameSync(docxPath,newPath)
            let zip = new AdmZip(newPath)
            const entries = zip.getEntries()
            for(let entry of entries){
                var entryName = entry.entryName;
                if(entryName === 'word/document.xml'){
                    //console.log(decompressedData);
                    const content: string = zip.readAsText(entry)
                    const doc = new DOMParser().parseFromString(content)
                    const listData = doc.getElementsByTagName('w:t')
                    for(let i = 0; i<listData.length;i++ ){
                        const text = listData.item(i).textContent
                        if(this.regexEmail.test(text)){
                            listData.item(i).textContent = listData.item(i).textContent.replace(this.regexEmail,'***********')
                            if(email === ''){
                                email = text.match(this.regexEmail)[0]
                            }
                        }
                        if(this.regexFacebook.test(text)){
                            listData.item(i).textContent = listData.item(i).textContent.replace(this.regexFacebook,'***********')
                        }
                        if(this.regexLinkedln.test(text)){
                            listData.item(i).textContent = listData.item(i).textContent.replace(this.regexLinkedln,'***********')
                        }
                        if(this.regexPhone.test(text)){
                            listData.item(i).textContent = listData.item(i).textContent.replace(this.regexPhone,'***********')
                            if(phone === ''){
                                phone = text.match(this.regexPhone)[0]
                            }
                        }
                    }
                    zip.updateFile(entry,Buffer.from(''+doc,'utf8'))
                    //zip.updateFile(entry,result) // xài buffer hay content đều được
                   // console.log(zip.readAsText(entry)); // outputs the decompressed content of the entry  
                   break;
                }
            }
            zip.writeZip(pathHided +'.zip')
            fs.rename(newPath,docxPath, (err)=>{
                if(err){
                    console.log(err);
                }
            })
            fs.rename(pathHided+'.zip',pathHided, (err)=>{
                if(err){
                    console.log(err);
                }
            })
            return {message: 'Success', status: 0, pathOriginal: docxPath, pathHided, email, phone}
           // console.log(zipEntries[0].entryName);
        } catch (error) {
            return {message: ''+error, status: 1, pathOriginal: '', pathHided: '', email: '', phone: ''}
        }
    }


    public hidehtml(htmlPath: string): {message: string, status: number, pathOriginal: string, pathHided: string}{
        try {
            const filename = path.basename(htmlPath, path.extname(htmlPath))
            let content = fs.readFileSync(htmlPath,'utf-8')
            let pathHided = Constants.pathTmpFixedCv + filename + '.html'
            //console.log(decompressedData);
            
            content = content.replace(this.regexEmail,'**********').replace(this.regexPhone,'***********').replace(this.regexLinkedln,'***********').replace(this.regexFacebook,'***********')
            fs.writeFileSync(pathHided, content)
            // const doc = new DOMParser().parseFromString(content)
            // const listData = doc.getElementsByTagName('*')
            // for(let i = 0; i<listData.length;i++ ){
            //     const text = listData.item(i).textContent
            //     if(this.regexEmail.test(text) || this.regexFacebook.test(text) || this.regexLinkedln.test(text) || this.regexPhone.test(text)){
            //         listData.item(i).textContent = '***********'
            //     }
            // }
            // console.log(''+doc);
            
            //zip.updateFile(entry,result) // xài buffer hay content đều được
           // console.log(zip.readAsText(entry)); // outputs the decompressed content of the entry 
            
            return {message: 'Success', status: 0, pathOriginal: htmlPath, pathHided}
           // console.log(zipEntries[0].entryName);
        } catch (error) {
            return {message: ''+error, status: 1, pathOriginal: '', pathHided: ''}
        }
    }

    

    
}