import CustomErrorHandler from "../../services/CustomErrorHandler";
import { User } from "../../models";

const userController = {
    async me(req, res, next){
        // as this is get request, so simply get data from DB
        try {
            const user = await User.findOne({ _id: req.user._id }).select('-password -updatedAt -__v');
            if(!user){
                return next(CustomErrorHandler.notFound());
            }
            res.json(user);
        }
        catch(err) {
            return next(err);
        }
    }
}
export default userController;