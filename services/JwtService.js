import { JWT_SECRET } from '../config';
import jwt from 'jsonwebtoken';


class JwtService {
    // payload => what to store in token
    static sign(payload, expiry='60s', secret=JWT_SECRET){ // token sign means create token
        return jwt.sign(payload, secret, { expiresIn: expiry });
    }

    static verify(token, secret=JWT_SECRET){
        return jwt.verify(token,secret);
    }
}
export default JwtService;