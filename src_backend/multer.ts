import multer from 'multer'
import fs from 'fs'
import path from 'path'

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'image') {
            cb(null, './assets/images')
        } else {
            cb(null, './assets/bank_account_images')
        }
    },
    filename: (req, file, cb) => {
        if (file.fieldname === 'image') {
            if (req.params.id !== undefined) {
                cb(null, req.params.id + '.' + file.mimetype.split('/')[1])
            } else {
                cb(null, new Date().getTime() + '.' + file.mimetype.split('/')[1])
            }
        } else {
            cb(null, new Date().getTime() + "-" + file.fieldname + '.' + file.mimetype.split('/')[1])
        }

    },
})

const storageCvTmp = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'cvfile') {
            if (req.params.id !== undefined) {
                cb(null, './assets/original_link_cv')

            } else {
                cb(null, './assets/tmp_original')
            }
        }
    },
    filename: (req, file, cb) => {
        if (file.fieldname === 'cvfile') {
            cb(null, new Date().getTime() + path.extname(file.originalname))
        }
    },
})

const storageCompanyImage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'imageCompany') {
            cb(null, './assets/company_images')
        }
    },
    filename: (req, file, cb) => {
        if (file.fieldname === 'imageCompany') {
            cb(null, new Date().getTime() + path.extname(file.originalname))
        }
    },
})


//upload user image

const upload = multer({ storage: storage, fileFilter: fileFilter })
const imageUpload = upload.single('image')

export const uploadUserImage = (req, res, next) => {
    imageUpload(req, res, (err) => {
        if (req.fileValidationError) {
            return res.status(400).send({ error: req.fileValidationError })
        } else if (err instanceof multer.MulterError) {
            return res.status(400).send({ error: err })
        } else if (err) {
            return res.status(500).send({ error: err })
        } else {
            if (req.file !== undefined) {
                removePreviousImage(req.params.id, req.file.mimetype.split('/')[1])
            }
            next()
        }
    })
}

//upload bank account image

const bankImageUpload = upload.fields(
    [
        { name: 'front_side_image', maxCount: 1 },
        { name: 'back_side_image', maxCount: 1 }
    ]
)

export const uploadBankImage = (req, res, next) => {
    bankImageUpload(req, res, (err) => {
        if (req.fileValidationError) {
            return res.status(400).send({ error: req.fileValidationError })
        } else if (err instanceof multer.MulterError) {
            return res.status(400).send({ error: err })
        } else if (err) {
            return res.status(500).send({ error: err })
        } else {
            if (req.files !== undefined) {
                var fileKeys = Object.keys(req.files)
                for (const key of fileKeys) {
                    const fileName = req.files[key][0].fileName
                    const ext = req.files[key][0].mimetype.split('/')[1]
                    removePreviousImage(fileName, ext)
                }
            }
            next()
        }
    })
}

// upload company image
const uploadCompany = multer({ storage: storageCompanyImage, fileFilter: fileFilter })
const imageCompanyUpload = uploadCompany.single('imageCompany')

export const uploadCompanyImage = (req, res, next) => {
    imageCompanyUpload(req, res, (err) => {
        if (req.fileValidationError) {
            return res.status(400).send({ error: req.fileValidationError })
        } else if (err instanceof multer.MulterError) {
            return res.status(400).send({ error: err })
        } else if (err) {
            return res.status(500).send({ error: err })
        } else {
            if (req.file !== undefined) {
                removePreviousImage(req.params.id, req.file.mimetype.split('/')[1])
            }
            next()
        }
    })
}

//upload cv

const cvUpload = multer({ storage: storageCvTmp, fileFilter: cvFileFilter })
const cvMulter = cvUpload.single('cvfile')


export const uploadCv = (req, res, next) => {
    cvMulter(req, res, (err) => {
        if (req.fileValidationError) {
            return res.status(400).send({ error: req.fileValidationError })
        } else if (err instanceof multer.MulterError) {
            return res.status(400).send({ error: err })
        } else if (err) {
            return res.status(500).send({ error: err })
        } else {
            next()
        }
    })
}


function fileFilter(req, file, cb) {
    if (file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
        cb(null, true);
    } else {
        req.fileValidationError = 'Only image allowed';
        cb(null, false);
    }

}

function removePreviousImage(fileName: string, extFile: string) {
    var extNames = ['jpg', 'jpeg', 'png']
    for (const extName of extNames) {
        if (extName !== extFile) {
            if (fs.existsSync(`./assets/images/${fileName}.${extName}`)) {
                fs.unlinkSync(`./assets/images/${fileName}.${extName}`)
            }
        }
    }
}



function cvFileFilter(req, file,cb){
    if (file.originalname.match(/\.(pdf)|(docx)|(html)|(PDF)|(DOCX)|(HTML)$/)) {
        cb(null, true);
    } else {
        req.fileValidationError = 'Only pdf, docx, html allowed';
        cb(null, false);
    }
}



