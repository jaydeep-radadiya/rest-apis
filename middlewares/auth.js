import CustomErrorHandler from '../services/CustomErrorHandler';
import JwtService from '../services/JwtService';

const auth = async (req, res, next) => {
    // parse token from request header
    let authHeader = req.headers.authorization;
    if(!authHeader){
        return next(CustomErrorHandler.unAuthorized());
    }
    const token = authHeader.split(' ')[1];

    // verify that token is manipulated by someone or not
    try {
        const { _id, role } = await JwtService.verify(token);
        // key & value both are same
        const user = {
            _id,
            role
        }
        req.user = user; // add property on request object
        next(); // normal middleware, for calling next subsequent middlewares
    }
    catch(err) {
        return next(CustomErrorHandler.unAuthorized());
    }
}

export default auth;