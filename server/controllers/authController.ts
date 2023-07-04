import { Request, Response } from 'express';
import { constants } from '../constants'
import asyncHandler from 'express-async-handler'
import User from "../models/userModel";

//@desc Create a User
//@route POST /api/auth/create-user
//@access public
const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  if ( !email || !username || !password ) {
    res.status(constants.VALIDATION_ERROR);
    throw new Error("Missing required fields")
  }

  const user = await User.create(
    {
      email,
      username,
      password,
    }
  )

  res.status(constants.RECORD_CREATED).json(user);

});

module.exports = { createUser };