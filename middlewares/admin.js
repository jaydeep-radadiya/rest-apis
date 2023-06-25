import CustomErrorHandler from "../services/CustomErrorHandler";
import { User } from '../models';

const admin = async (req, res, next) => {
    try {
        // auth middleware adds user in request object
        // so admin middleware should be run after the auth
        const user = await User.findOne({ _id: req.user._id });
        if(user.role==='admin'){
            next(); // this expty next() is not error, just call the next middleware
            // if we pass somwthing inside the next then there is an error
        }
        else{
            return next(CustomErrorHandler.unAuthorized());
        }
    }
    catch(err) {
        return next(CustomErrorHandler.serverError());
    }
}

export default admin;