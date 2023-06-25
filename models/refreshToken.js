import mongoose from "mongoose";
const Schema = mongoose.Schema;


const refreshTokenSchema = new Schema({
    token: { type: String, unique: true },
}, { timestamps: false });

export default mongoose.model('RefreshToken', refreshTokenSchema, 'refreshTokens');

// RefreshToken: model name
// refreshTokens: table/collection name

// unique: true => index automatically added for fast searching