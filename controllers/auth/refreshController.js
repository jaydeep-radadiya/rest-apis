import Joi from "joi";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import { RefreshToken, User } from "../../models";
import JwtService from "../../services/JwtService";
import { REFRESH_SECRET } from "../../config";

const refreshController = {
    async refresh(req, res, next){
        // validate request
        const refreshSchema = Joi.object({
            refresh_token: Joi.string().required(),
        })
        const { error } = refreshSchema.validate(req.body);
        if(error){
            return next(error);
        }

        // if refresh token exist in db then only issue new access token
        // if token doesn't exist means user logged out
        let refreshtoken;
        try {
            // check refresh token exist or not
            refreshtoken = await RefreshToken.findOne({ token: req.body.refresh_token });
            if(!refreshtoken){
                return next(CustomErrorHandler.unAuthorized('invalid refresh token'));
            }

            // verify refresh token
            let userId;
            try {
                // if token has been verified sucessfully then it returns payload
                const { _id } = await JwtService.verify(refreshtoken.token, REFRESH_SECRET);
                userId = _id;
            }
            catch(err) {
                return next(CustomErrorHandler.unAuthorized('invalid refresh token'));
            }

            // check user exist in db or not
            const user = await User.findOne({ _id: userId })
            if(!user){
                return next(CustomErrorHandler.unAuthorized('no user found'));
            }

            // generate 2 types of tokens: 1) access token 2) refresh token (new)
            const access_token = JwtService.sign({ _id: user._id, role: user.role });
            const refresh_token = JwtService.sign({ _id: user._id, role: user.role }, '1y', REFRESH_SECRET);
            // store new refresh token in db
            await RefreshToken.create({ token: refresh_token })
            res.json({ access_token, refresh_token }); // key & val are same => write once 
        }
        catch(err) {
            // return next(err);
            return next(new Error('something went wrong ' + err.message));
        }
    }
}

export default refreshController;