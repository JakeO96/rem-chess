import { Request, Response } from 'express';
import { constants } from '../constants'
import asyncHandler from 'express-async-handler'
import User from "../models/userModel";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { ActiveUser } from '../models/userModel';

interface RequestWithUser extends Request {
  user?: ActiveUser;
}

//@desc Create a User
//@route POST /api/auth/create-user
//@access public
const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, username, password } = req.body;
  if ( !email || !username || !password ) {
    res.status(constants.VALIDATION_ERROR);
    throw new Error("Missing required fields")
  }
  const userAlreadyExists = await User.findOne({ email });
  if (userAlreadyExists) {
    res.status(constants.VALIDATION_ERROR);
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
    res.status(constants.RECORD_CREATED).json({id: user._id, email: user.email, username: user.username});
  } catch (error) {
    res.status(constants.SERVER_ERROR);
    throw new Error(`Problem storing password ${error}`);
  }
});

//@desc Log a User in (authenticate)
//@route POST /api/auth/login
//@access public
const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if ( !email || !password ) {
    res.status(constants.VALIDATION_ERROR);
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
      res.status(constants.SUCCESS).json({ accessToken })
    }
    else {
      res.status(constants.UNAUTHORIZED)
      throw new Error("Email or password is not valid")
    }
  }
});

//@desc The current user's info
//@route GET /api/auth/current-user
//@access private
const currentUser = asyncHandler(async (req: RequestWithUser, res: Response) => {
  res.status(constants.SUCCESS).json(req.user); 

});

module.exports = { createUser, login, currentUser };