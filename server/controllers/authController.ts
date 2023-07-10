import { Request, Response } from 'express';
import { HttpStatusCode } from '../constants'
import asyncHandler from 'express-async-handler'
import User from "../models/userModel";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

//@desc Create a User
//@route POST /api/auth/register
//@access public
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, username, password } = req.body;
  if ( !email || !username || !password ) {
    res.status(HttpStatusCode.VALIDATION_ERROR);
    throw new Error("Missing required fields")
  }
  const userAlreadyExists = await User.findOne({ email });
  if (userAlreadyExists) {
    res.status(HttpStatusCode.VALIDATION_ERROR);
    throw new Error("User already exists")
  }

  const saltRounds = process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS, 10) : 10;
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = new User({
      email: email,
      username: username,
      password: hashedPassword,
    });
    await user.save();
    res.status(HttpStatusCode.RECORD_CREATED).json({id: user._id, email: user.email, username: user.username});
  } catch (error) {
    res.status(HttpStatusCode.SERVER_ERROR);
    throw new Error(`Problem storing password ${error}`);
  }
});

//@desc Log a User in (authenticate)
//@route POST /api/auth/login
//@access public
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if ( !email || !password ) {
    res.status(HttpStatusCode.VALIDATION_ERROR);
    throw new Error("Missing required fields")
  }

  const secret = process.env.JWT_SECRET;
  if(secret){
    const user = await User.findOne( { email });
    if(user && (await bcrypt.compare(password, user.password))) {
      const accessToken = jwt.sign(
        {
          user: {
            email: user.email,
            username: user.username,
            id: user._id,
          },
        }, 
        secret,
        {expiresIn: "15m"}
      );
      res.status(HttpStatusCode.SUCCESS).json({ accessToken })
    }
    else {
      res.status(HttpStatusCode.UNAUTHORIZED)
      throw new Error("Email or password is not valid")
    }
  }
});