import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from '../constants'
import asyncHandler from 'express-async-handler'
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../models/userModel'

interface RequestWithUser extends Request {
  user?: string | object;
}

const extractToken = (req: RequestWithUser): string | undefined => {
  let token: string | undefined = req.cookies.token;
  console.log(`Token: ${token}`);
  if (!token) {
    return undefined;
  }
  return token;
}

const validateToken = asyncHandler(async (req: RequestWithUser, res: Response, next: NextFunction) => {
  let token: string | undefined = extractToken(req);
  console.log(`in validateToken the token is ${token}`)
  if (token) {
    try {
      const secret = process.env.JWT_SECRET;
      if(secret){
        jwt.verify(token, secret, async (err, decoded) => {     
          if(err) {
            if(err instanceof jwt.TokenExpiredError) {
              res.status(HttpStatusCode.UNAUTHORIZED);
              throw new Error("Session has expired. Please log in again.");
            } else {
              res.status(HttpStatusCode.UNAUTHORIZED);
              throw new Error("User not authorized");
            }
          }
          else {
            const decodedToken = decoded as JwtPayload;
            console.log(`decodedToken in valTokenHandler: ${decodedToken}`)
            req.user = decodedToken.user;
            console.log(`req.user in valTokenHandler: ${req.user} , decodedToken.user: ${decodedToken.user}`)
            const sessionId = decodedToken.user.sessionId;
            console.log(`sessionId in valTokenHandler: ${sessionId}`)
            // Fetch user from database using the ID in decodedToken
            const user = await User.findById(decodedToken.user.id);
            if (user && user.session.sessionId === sessionId && user.session.endTime === null) {
              next();
            } else {
              res.status(HttpStatusCode.UNAUTHORIZED);
              throw new Error("Invalid session");
            }
          }
        })
      }
      else {
        res.status(HttpStatusCode.SERVER_ERROR);
        throw new Error("There was a problem processing your request");
      }
    } catch (error) {
      res.status(HttpStatusCode.UNAUTHORIZED);
      throw new Error("User not authorized");
    }
  } else {
    res.status(HttpStatusCode.UNAUTHORIZED);
    throw new Error("User not authorized");
  }
})

export { validateToken }