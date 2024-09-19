//pdf to image

import pdf from 'pdf-poppler'
import {Poppler} from 'node-poppler'
import imagesToPdf from 'images-to-pdf'
import { Coordinate, ListCoordinates, Output, PDFParser } from './parsePDF';
import pixelWidth from 'string-pixel-width'
import path from 'path';
import HummusRecipe from 'hummus-recipe'
import fs from 'fs'
import { injectable } from 'inversify';
import { Constants } from '../common/constants'
import logger from '../logger/winston'
import pdfparse from 'pdf-parse'

export interface IPdfHandler{
    hideInfo(pathFile: string,  originalFileName: string, candidateExsited: boolean): Promise<{pathOriginal: string, pathHided: string, message: string, status: number, email: string, phone: string}>
    removeAccents(str: string): string;
}

export class ImageOption{
    format: string;
    scale: number;
    out_dir:string;
    out_prefix: string;
    page:number | null;

}


@injectable()
export class PdfHandler implements IPdfHandler{

    regexPhone: RegExp = /[(]?[+]?(0|\84)[)]?(\s|\.)?((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))(\d)(\s|\.)?(\d{3})(\s|\.)?(\d{3})/g
    regexFacebook: RegExp =  /https?:\/\/([\w]+\.)?(facebook|fb)\.com\/[a-zA-Z0-9_.?=]*/g
    regexLinkedln:RegExp = /https?:\/\/[\w]+\.?linkedin\.com\/in\/[A-z0-9_-]+\/?/g
    regexEmail: RegExp = /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))|[a-zA-Z0-9]@|\S+[a-z0-9]@+/g

    constructor(){

    }

    public async hideInfo(pathFile: string, originalFileName: string, candidateExsited: boolean): Promise<{pathOriginal: string, pathHided: string, message: string, status: number, email: string, phone: string}>{
        const filename: string = path.basename(pathFile, path.extname(pathFile)) +'.pdf'; 
        let outputPath: string = Constants.pathTmpFixedCv + filename
        const resultGetEmailAndPhone = await this.getEmailAndPhoneInPdf(Constants.pathTmpOriginalCv + filename)
        let email = resultGetEmailAndPhone.email
        let phone = resultGetEmailAndPhone.phone
        if(candidateExsited){
            outputPath = Constants.pathFixedCv + filename 
        }
        try{
            const parsePDF: PDFParser = new PDFParser();
            const listCoordinates: ListCoordinates | undefined = await parsePDF.getCoordinate(pathFile); 
            if(listCoordinates !== undefined){
                // const opts: ImageOption = new ImageOption();
                // opts.format = 'jpeg';
                // opts.scale = 2000;
                // opts.out_dir= './assets/images_tmp';
                // opts.out_prefix=  path.basename(pathFile, path.extname(pathFile)) + '_Fixed';
                // opts.page = null
    
                let outputPath: string = Constants.pathTmpFixedCv + filename
                if(candidateExsited){
                    outputPath = Constants.pathFixedCv + filename
                }
                const coordinates:Coordinate[] | undefined = listCoordinates?.coordinates;
                const resultDrawShape = this.drawShape(coordinates,pathFile, outputPath);
                const resultParsePdfToImage = await this.parsePdfToImage(filename,outputPath,listCoordinates.numberOfPage);
                if(resultParsePdfToImage.error){
                   fs.copyFileSync(pathFile, outputPath);
                   logger.error('Fail parse pdf to image (File error: '+filename+' )');
                   return {pathOriginal: pathFile, pathHided: outputPath,message: 'Fail parse pdf to image (File error: '+filename+' )', status: 0, email, phone }    
                }
                const listOutputImage: string [] = resultParsePdfToImage.listOutputImage
                
                if(listOutputImage.length === 0){
                   fs.copyFileSync(pathFile, outputPath);
                   logger.error('Fail parse pdf to image (File error: '+filename+' )');
                   return {pathOriginal: pathFile, pathHided: outputPath,message: 'Fail parse pdf to image (File error: '+filename+' )', status: 0, email, phone } 
                }
                const result: number = await this.parseImageToPdf(listOutputImage,outputPath)
                if(result === 0 ){
                    for (let index = 0; index < listOutputImage.length; index++) {
                        fs.unlink(listOutputImage[index], (err) => {
                            if (err) {
                                console.log(err)
                            };
                        })
                    }
                    return {pathOriginal: pathFile, pathHided: outputPath,message: 'Success', status: 0,email: resultDrawShape.email, phone: resultDrawShape.phone}
                }else{
                    fs.copyFileSync(pathFile, outputPath);
                    return {pathOriginal: pathFile, pathHided: outputPath,message: 'Fail parse image to pdf (File error: '+filename+ ' )', status: 0, email, phone} 
                }
            }
            fs.copyFileSync(pathFile, outputPath);
            logger.error('Get coordinates of text lines in pdf file failed. (filename: '+filename+')');
            return {pathOriginal: pathFile, pathHided: outputPath,message: 'Get coordinates of text lines in pdf file failed. (filename: '+filename+')', status: 0, email, phone } 
        }catch(error){
            fs.copyFileSync(pathFile, outputPath);
            logger.error('(File error: '+originalFileName+ ' )');
            return {pathOriginal: pathFile, pathHided: outputPath,message: '(File error: '+filename+ ' )', status: 0, email, phone}
        }
   }
   private getIndicesOf(searchStr:string, str:string): number[] {
    let searchStrLen: number = searchStr.length;
    if (searchStrLen === 0) {
        return [];
    }
    let startIndex: number = 0;
    let index: number;

    let indices: number[] = [];
    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
        indices.push(index);
        startIndex = index + searchStrLen;
    }
    return indices;
   }

   private drawShape(coordinates:Coordinate[] ,inputPath: string, outputPath: string) : {email: string, phone: string} {
    let listOutput: Output[] = [];
    let email = ''
    let phone = ''
    for (let index = 0; index < coordinates.length; index++) {
        const element:Coordinate = coordinates[index];
        let strContainUserInfo: string = '' + element.content.str;
  
        let listEmailInString:RegExpMatchArray| null  = strContainUserInfo.match(this.regexEmail);
        
        if (listEmailInString === null) {
            listEmailInString = []
        }else if (email === ''){
            email = ''+listEmailInString[0]
        }
        let listPhoneInString = strContainUserInfo.match(this.regexPhone);
        if (listPhoneInString === null) {
            listPhoneInString = []
        }else if (phone === ''){
            phone = ''+listPhoneInString[0]
        }
        
        let listFacebookInString = strContainUserInfo.match(this.regexFacebook);
        if (listFacebookInString === null) {
            listFacebookInString = []
        }
        let listLinkedInInString = strContainUserInfo.match(this.regexLinkedln);
        if (listLinkedInInString === null) {
            listLinkedInInString = []
        }
  
  
        let listStartIndexUserInfo: number[] = [] // vd : hello world mrhiep314@gmail.com hello 0338546575 koko mrhiep314@gmail.com
        let listUserInfo: string[] = listEmailInString.concat(listPhoneInString, listFacebookInString, listLinkedInInString); // vd mrhiep314@gmail.com,0338546575,mrhiep314@gmail.com
        if (strContainUserInfo.trim() === listUserInfo[0]) { // đoạn đó chỉ chứa email hoặc sdt
             let output: Output = new Output();
             output.x = element.content.x - 1;
             output.y = element.content.y - element.content.height + 1.5;
             output.width = element.content.width + 1.3;
             output.height = element.content.height + 2;
             output.page =  element.page
            listOutput.push(output)
        } else {
            for (let i = 0; i < listUserInfo.length; i++) { // lấy index các user info trong đoạn chứa nó
                listStartIndexUserInfo = listStartIndexUserInfo.concat(this.getIndicesOf(listUserInfo[i], strContainUserInfo));
            }
            listStartIndexUserInfo = [...new Set(listStartIndexUserInfo)] // unique value
            for (let i = 0; i < listStartIndexUserInfo.length; i++) {
                const userInfo = listUserInfo[i]
                let output =  new Output();
 
                const indexUserInfo = listStartIndexUserInfo[i];
                const strFromStartToIndexUserInfo = strContainUserInfo.substring(0, indexUserInfo)
                const widthStrcFromStartToIndexInfo = this.calculateWidthString(strFromStartToIndexUserInfo, strContainUserInfo, element.content.width)
                const widthUserInfo = this.calculateWidthString(userInfo, strContainUserInfo, element.content.width)
                output.x = element.content.x + widthStrcFromStartToIndexInfo;
                output.width = widthUserInfo + 1.3
                output.y = element.content.y - element.content.height + 1.5
                if (userInfo.indexOf('@') !== -1) {
                    output.height = element.content.height + 1.5
                } else {
                    output.height = element.content.height + 2
                }
                output.page = element.page
                listOutput.push(output)
            }
        }
    }
    const pdfDoc = new HummusRecipe(inputPath, outputPath)
    // const pdfDoc2 = new PDFDocument();
    // pdfDoc2.pipe(fs.createWriteStream(inputPath));
    
    this.draw(listOutput, pdfDoc)
    return {email, phone}
  }

   private calculateWidthString(strToCalcularWidth: string, fullStr:string, originalWidthString:number): number {
 
    const widthSpecString: number = pixelWidth(strToCalcularWidth, { size: 15 }) // 55.949
    const widthFullStr: number = pixelWidth(fullStr, { size: 15 }) //  212.4

    const trueWidth: number = widthSpecString * originalWidthString / widthFullStr
    return trueWidth

}
    private async parsePdfToImage(filenameOriginal: string,file: string, numberOfPage:number): Promise<{listOutputImage: string[], error: boolean}>{
        try {
            const listOutputImage: string[] =[]
            let poppler
            if(process.env.ENV === 'local'){
                poppler = new Poppler();
            }else{
                poppler = new Poppler('/usr/bin');
            }      
            const options = {
                firstPageToConvert: 1,
                pngFile: true,
            };
            const outputFile = './assets/images_tmp/'+filenameOriginal;
            const res = await poppler.pdfToCairo(file, outputFile, options);
            if(typeof(res) === 'string'){
                for (let index = 0; index < numberOfPage; index++) {
                    let image = './assets/images_tmp/' + filenameOriginal + '-' + (index + 1) + '.png'
                    listOutputImage.push(image)
                } 
            }else{
                return {listOutputImage: [], error: true}  
            }
            //await pdf.convert(file, opts);
            return {listOutputImage, error: false};
            
        } catch (error) {
            console.log(error);
            return {listOutputImage: [], error: true}
        }
    }
    public removeAccents(str: string) {
        var AccentsMap = [
          "aàảãáạăằẳẵắặâầẩẫấậ",
          "AÀẢÃÁẠĂẰẲẴẮẶÂẦẨẪẤẬ",
          "dđ", "DĐ",
          "eèẻẽéẹêềểễếệ",
          "EÈẺẼÉẸÊỀỂỄẾỆ",
          "iìỉĩíị",
          "IÌỈĨÍỊ",
          "oòỏõóọôồổỗốộơờởỡớợ",
          "OÒỎÕÓỌÔỒỔỖỐỘƠỜỞỠỚỢ",
          "uùủũúụưừửữứự",
          "UÙỦŨÚỤƯỪỬỮỨỰ",
          "yỳỷỹýỵ",
          "YỲỶỸÝỴ"    
        ];
        for (var i=0; i<AccentsMap.length; i++) {
          var re = new RegExp('[' + AccentsMap[i].substr(1) + ']', 'g');
          var char = AccentsMap[i][0];
          str = str.replace(re, char);
        }
        return str;
    }

    private draw(listOuput:Output[], pdfDoc: HummusRecipe) {
        const pagesNumber: number[] = []
        for (let index = 0; index < listOuput.length; index++) {
            const element: Output = listOuput[index];
            
            if (pagesNumber.indexOf(element.page) === -1) {
                if (pagesNumber.length > 0) {
                    pdfDoc.endPage()
                }
                pdfDoc.editPage(element.page)
                pagesNumber.push(element.page)
            }
            pdfDoc.rectangle(
                element.x,
                element.y,
                element.width,
                element.height, {
                    fill: '#3366FF',
                    stroke: '#FF6633',
                    lineWidth: 3,
                    opacity: 2
                }
            )
        }
        pdfDoc.endPage()
        pdfDoc.endPDF()
    }

    private async getEmailAndPhoneInPdf(pathCvOriginal: string): Promise<{email: string, phone: string}>{
        let dataBuffer = fs.readFileSync(pathCvOriginal)
        const dataCv = await pdfparse(dataBuffer)
        const contentCv = dataCv.text
        let listEmail: string[] = contentCv.match(this.regexEmail) ?? ['']
        let listPhone: string[] = contentCv.match(this.regexPhone) ?? ['']
        return {email: listEmail[0], phone: listPhone[0]}
    }
    
    private async parseImageToPdf(listImageName: string[], filepath: string):Promise<number>{
        try {
            const result = await imagesToPdf(listImageName,filepath);
            return 0;
        } catch (error) {
            console.log(error);
            return 1;
        }
           
    }
}
