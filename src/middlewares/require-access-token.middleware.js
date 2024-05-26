import { prisma } from '../utils/prisma.util';
import { ENV } from '../constants/env.constant';
import { validateToken } from '../utils/jwt.util';
import { USER_MESSAGES } from '../constants/user.constant';
import { AUTH_MESSAGES } from '../constants/auth.constant';
import { catchError } from './error-handling.middleware';

/* accessToken 검증 미들웨어 */
const accessMiddleware = catchError(async (req, res, next) =>{
  const accessToken = req.headers.authorization;
  
  if(!accessToken){
    return res.status(400).json({
      status:400,
      message: AUTH_MESSAGES.NO_AUTH_INFO
    });
  }
  
  const token = accessToken.split('Bearer ')[1];
  if(!token){
    return res.status(401).json({
      status:401,
      message: AUTH_MESSAGES.UNSUPPORTED_AUTH
    });
  }
  
  const payload = await validateToken(token, ENV.ACCESS_KEY);
  if(payload === 'expired'){
    return res.status(401).json({
      status:401,
      message: AUTH_MESSAGES.TOKEN_EXPIRED
    });
  }else if(payload === 'JsonWebTokenError'){
    return res.status(401).json({
      status:401,
      message: AUTH_MESSAGES.INVALID_AUTH
    });
  }
  
  const user = await prisma.user.findUnique({
    where: { userId: payload.userId }
  });
  if(!user) {
    return res.status(404).json({
      status:404,
      message: USER_MESSAGES.USER_NOT_FOUND
    });
  }
  req.user = user;
  next();  
});

export {accessMiddleware};