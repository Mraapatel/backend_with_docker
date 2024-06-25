const jwt = require('jsonwebtoken');
const { Admin } = require('../controllers/jwt_token-controller');

const secretKey = process.env.SECRET_VARIABLE;

async function verifyToken(req, res, next) {
    console.log('-------------------inside the verity token --------------------');
    const authorization = req.headers.authorization;
    const token = authorization.split(' ')[1];
    // console.log(typeof (token));
    // console.log(token);
    // console.log('inside the verity token ');
    // console.log(req.headers);
    // console.log('starts with or not ' + authorization.startsWith('Bearer'));

    if (!authorization || !authorization.startsWith('Bearer')) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, secretKey, async (err, decoded) => {
        if (err) {
            console.log('varify token error', err);
            if (err.name === 'TokenExpiredError') {
                return res.status(403).json({ message: 'Token has expired' });
            } else if (err.name === 'JsonWebTokenError') {
                return res.status(403).json({ message: 'Invalid token' });
            }
            return res.status(403).json({ message: 'Failed to authenticate token' });
        }
        console.log('decode----->', decoded);
        let existAdmin = await Admin.findById({ _id: decoded.id });
        console.log('existAdming----->', existAdmin);

        if (!existAdmin) {
            throw new  Error('admin not found');
            return;
            // console.log('next ni niche------------');
            // return req.decoded = decoded;
        }
        if(existAdmin){
            next(); 
        }
        
        // return res.status(403).json({ message: 'Failed to authenticate token' });
    });
}

//  async function varifyAdmin(decoded) {
//      console.log('inside the varifyAdmin---->', decoded);
//      let existAdmin = await Admin.findById({ _id: decoded.id });
//      console.log('after existAdmin---->', existAdmin);
//      if (existAdmin) {
//          return true
//      }
//      return false
//  }

module.exports = verifyToken;
