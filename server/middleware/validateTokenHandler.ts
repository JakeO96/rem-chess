import { Request, Response, NextFunction } from 'express';
import { constants } from '../constants'
import asyncHandler from 'express-async-handler'
import jwt, { JwtPayload } from 'jsonwebtoken';

interface RequestWithUser extends Request {
  user?: string | object;
}

const validateToken = asyncHandler(async (req: RequestWithUser, res: Response, next: NextFunction) => {
  let token: string;
  let authHeader = req.headers.Authorization || req.headers.authorization;
  if (typeof authHeader !== 'string') {
    res.status(constants.VALIDATION_ERROR);
    throw new Error('Invalid Authorization header');
  }
  const secret = process.env.JWT_SECRET;
  if(secret) {
    if(authHeader && authHeader.startsWith("Bearer")) {
      token = authHeader.split(" ")[1];
      if(!token) {
        res.status(constants.UNAUTHORIZED);
        throw new Error("User is unauthorized or token is missing")
      }
      jwt.verify(token, secret, (err, decoded) => {     
        if(err) {
          res.status(constants.UNAUTHORIZED);
          throw new Error("User is not authorized");
        }
        if(decoded) {
          const payload = decoded as JwtPayload;
          req.user = payload.user;
          next();
        }
      })
    }
  }
})

export { validateToken }