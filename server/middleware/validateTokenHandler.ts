import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from '../constants'
import asyncHandler from 'express-async-handler'
import jwt, { JwtPayload } from 'jsonwebtoken';

interface RequestWithUser extends Request {
  user?: string | object;
}

const extractToken = (req: RequestWithUser): string | undefined => {
  let authHeader: string | string[] | undefined = req.headers.Authorization || req.headers.authorization;
  if (typeof authHeader !== 'string') {
    return undefined
  }
  if(authHeader && authHeader.startsWith("Bearer")) {
    let headerParts: string[] = authHeader.split(" ");
    if (headerParts.length !== 2 || headerParts[0].toLowerCase() !== 'bearer') {
      return undefined
    }
  }
  else {
    return undefined
  }
  return authHeader.split(" ")[1];
}

const validateToken = asyncHandler(async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const secret = process.env.JWT_SECRET;
  if(secret) {
    let token: string | undefined = extractToken(req);
    if(!token) {
      res.status(HttpStatusCode.UNAUTHORIZED);
      throw new Error("User not authorized")
    }
    jwt.verify(token, secret, (err, decoded) => {     
      if(err) {
        res.status(HttpStatusCode.UNAUTHORIZED);
        throw new Error("User not authorized");
      }
      if(decoded) {
        const payload = decoded as JwtPayload;
        req.user = payload.user;
        next();
      }
    })
  }
  else {
    res.status(HttpStatusCode.SERVER_ERROR);
    throw new Error("There was a problem processing your request");
  }
})

export { validateToken }