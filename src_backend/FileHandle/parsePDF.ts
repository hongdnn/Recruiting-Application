//const PDFExtract = require('pdf.js-extract').PDFExtract


import {PDFExtract, PDFExtractResult} from 'pdf.js-extract'
const pdfExtract = new PDFExtract()



export class PDFParser{
     regexPhone: RegExp = /[(]?[+]?(0|\84)[)]?(\s|\.)?((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))(\d)(\s|\.)?(\d{3})(\s|\.)?(\d{3})/g
     regexFacebook:RegExp = /https?:\/\/[\w]+\.?(facebook|fb)\.com\/[a-zA-Z0-9_.?=]*/g
     regexLinkedln:RegExp = /https?:\/\/[\w]+\.?linkedin\.com\/in\/[A-z0-9_-]+\/?/g
     regexEmail:RegExp = /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))|\S+[a-z0-9]@+/g

    public checkMail(str: string){
        if (!this.regexEmail.test(str.toLowerCase())) {
            // if (/[.]vn|gmail[.]|[.]com/.test(str)) {
            //     return true;
            // }
            return false;
        }
        return true;
    }

    public getInfoPdf(filename: string): Promise<PDFExtractResult | undefined> {
        return new Promise((resolve, reject) => {
            pdfExtract.extract(filename, { normalizeWhitespace: true }, (error, pdf) => {
                if (error) reject(error)
                resolve(pdf)
            })
        })
    }
    public async getCoordinate(filename:string): Promise<ListCoordinates | undefined> {
        const data: PDFExtractResult | undefined = await this.getInfoPdf(filename)
        const listCoor: ListCoordinates | undefined = this.getCoordinateUserInfo(data)  
        return listCoor;
    }

    public getCoordinateUserInfo(data:PDFExtractResult | undefined) {
        let coordinates: Coordinate[] = []
        let numberOfPage = 0
        if(data !== undefined){
            data.pages.forEach(page => {
                numberOfPage += 1
                const contents = page.content;
                contents.forEach(content => {
                    
                    const str: string = '' + content.str
                    const checkEmail: boolean = this.checkMail(str)
                    const checkPhone: boolean = this.regexPhone.test(str)
                    const checkFacebook: boolean = this.regexFacebook.test(str.toLowerCase())
                    const checkLinkedIn: boolean = this.regexLinkedln.test(str.toLowerCase())
                    if (checkEmail || checkPhone || checkFacebook || checkLinkedIn) {
                        const output: Coordinate = {
                            page: page.pageInfo.num,
                            content: {
                                x: content.x,
                                y: content.y,
                                width: content.width,
                                height: content.height,
                                str: content.str
                            }
                        }
                        coordinates.push(output)
    
                    }
                })
            })
            return { coordinates, numberOfPage }
        }
        

    }

}


    // both facebook linkedin /https?:\/\/[\w]+\.?(facebook|linkedin)\.com\/[a-zA-Z0-9_.?=]*/g



export class Output{

    constructor(){
      
    }
    x: number;
      y: number;
      width: number;
      height: number;
      page: number; 
  }

  export class Content{
      constructor(){

      }
      x: number;
      y: number;
      width: number;
      height: number;
      str: string;
  }

  export class Coordinate{

    constructor(){
      
    }
    page: number;
    content: Content;
  }

  export class ListCoordinates{

    constructor(){

    }
    coordinates: Coordinate[];
    numberOfPage: number;


  }
  

