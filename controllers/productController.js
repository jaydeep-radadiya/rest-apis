import { Product } from '../models';
import multer from 'multer';
import path from 'path';
import CustomErrorHandler from '../services/CustomErrorHandler';
import fs from 'fs';
import Joi from 'joi';
import productSchema from '../validators/productValidator';


// define storage location
const storage = multer.diskStorage({
    destination: (req, file, callback) => callback(null, 'uploads/'),
    filename: (req, file, callback) => {
        // generate unique name for file
        // 1687670130147-352992341.png
        const uniqueName = `${Date.now()}-${Math.round(Math.random()*1e9)}${path.extname(file.originalname)}`;
        callback(null, uniqueName);
    }
})

// 5*10^6  = 5MB
const handleMultipartData = multer({ storage, limits: {fileSize: 1000000*5} }).single('image')

const productController = {
    async store(req, res, next){ // we made this as async , so we use await inside this
        // multipart form data
        handleMultipartData(req, res, async (err) => {
            if(err){
                return next(CustomErrorHandler.serverError(err.message));
            }
            const filePath = req.file.path;
            
            // validate request
            const { error } = productSchema.validate(req.body);
            if(error){
                // image uploads before the validation & validation fails then delete image
                // filePath: uploads/filename.png
                // need to generate root folder
                fs.unlink(`${appRoot}/${filePath}`, (err) => { // this callback eachtime called when file deleted
                    if(err){
                        return next(CustomErrorHandler.serverError());
                    }
                    console.log('uploaded file gets deleted...');
                });
                return next(error); // this is Joi's validation error
            }

            const { name, price, size } = req.body;
            let document;
            try {
                document = await Product.create({
                    name,
                    price,
                    size,
                    image: filePath
                })
            }
            catch(err) {
                return next(err);
            }
            res.status(201).json(document);
        });
    },

    update(req, res, next){
        handleMultipartData(req, res, async (err) => {
            if(err){
                return next(CustomErrorHandler.serverError(err.message));
            }
            let filePath;
            if(req.file){
                filePath = req.file.path;
            }
            
            // validate request
            const { error } = productSchema.validate(req.body);
            if(error){
                // image uploads before the validation & validation fails then delete image
                // filePath: uploads/filename.png
                // need to generate root folder
                if(req.file){
                    fs.unlink(`${appRoot}/${filePath}`, (err) => { // this callback eachtime called when file deleted
                        if(err){
                            return next(CustomErrorHandler.serverError());
                        }
                        console.log('uploaded file gets deleted...');
                    });
                    return next(error); // this is Joi's validation error
                }
            }

            const { name, price, size } = req.body;
            let document;
            try {
                document = await Product.findOneAndUpdate({ _id: req.params.id }, {
                    name,
                    price,
                    size,
                    ...(req.file && { image: filePath })
                }, { new: true })
                console.log(document);
            }
            catch(err) {
                return next(err);
            }
            res.status(201).json(document);
        });
    },

    async destroy(req, res, next){
        const document = await Product.findOneAndRemove({ _id: req.params.id });
        if(!document){
            return next(new Error('Nothing to delete'));
        }
        // delete image
        // without calling getters image: uploads/123-456.png
        // we applied getters on image field, and getters called when we get image
        // by calling getters image: http://localhost:5000/uploads/123-456.png
        // document._doc => get document without getters being called
        const imagePath = document._doc.image;
        fs.unlink(`${appRoot}/${imagePath}`, (err) => {
            if(err){
                return next(CustomErrorHandler.serverError());
            }
            res.json(document); // tell to the client that this document is deleted
        });
    },

    async getAllProducts(req, res, next){
        let documents; // store all documents
        try {
            // we get all documents in form of array
            documents = await Product.find().select('-updatedAt -__v').sort({ _id: -1});
            // if there are lots of products then use pagination, library: mongoose-pagination
        }
        catch(err) {
            return next(CustomErrorHandler.serverError());
        }
        return res.json(documents);
    },

    async getSingleProduct(req, res, next){
        let document;
        try {
            document = await Product.findOne({ _id: req.params.id }).select('-updatedAt -__v');
        }
        catch(err) {
            return next(CustomErrorHandler.serverError());
        }
        res.json(document);
    }
}

export default productController;