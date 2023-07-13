import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from '../constants'
import asyncHandler from 'express-async-handler'
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../models/userModel'

interface RequestWithUser extends Request {
  user?: string | object;
}

const extractToken = (req: RequestWithUser): string | undefined => {
  let authHeader: string | string[] | undefined = req.headers.Authorization || req.headers.authorization;
  console.log(`authHeader: ${authHeader}`)
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
            const sessionId = req.headers.sessionId;
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