import e, { Request, Response } from 'express';
import { constants } from '../constants';
import asyncHandler from 'express-async-handler';
import User from "../models/userModel";
import bcrypt from 'bcrypt';

//@desc Get a single User record
//@route GET /api/user/:id
//@access public
export const getAllUsers = asyncHandler( async (req: Request, res: Response) => {
  const users = await User.find({});
  if (users) {
    res.status(constants.SUCCESS).json(users);
  }
  else {
    res.status(constants.NOT_FOUND);
    throw new Error("User not found");
  }
});

//@desc Get a single User record by id
//@route GET /api/user/:id
//@access public
export const getUser = asyncHandler( async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if(user) {
    res.status(constants.SUCCESS).json(user);
  } 
  else {
    res.status(constants.NOT_FOUND);
    throw new Error("User not found");
  }
});

//@desc Check if an email exists
//@route POST /api/user/email-exists
//@access public
export const emailExists = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    res.status(constants.SUCCESS).json({ exists: true });
  } 
  else {
    res.status(constants.SUCCESS).json({ exists: false });
  }
});

//@desc Check if a username exists
//@route POST /api/user/username-exists
//@access public
export const usernameExists = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findOne({ username: req.body.username });
  if (user) {
    res.status(constants.SUCCESS).json({ exists: true });
  } else {
    res.status(constants.SUCCESS).json({ exists: false });
  }
});

//@desc Update a User record
//@route PUT /api/user/:id
//@access public
export const updateUser = asyncHandler( async (req: Request, res: Response) => {
  const { email, username, password } = req.body;
  const user = await User.findById(req.params.id);
  if (user){
    const saltRounds = process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS, 10) : 10;
    try {
      console.log(`In updateUser, the old hashedpassword is ${user.password}`);
      console.log(`In updateUser, the new password is ${password}`);
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedUpdatedPassword = await bcrypt.hash(password, salt);
      console.log(`In updateUser, the new hashed password is ${hashedUpdatedPassword}`);
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {email, username, password: hashedUpdatedPassword},
        { new: true }
      )
      if(updatedUser) {
        res.status(constants.SUCCESS).json({id: updatedUser._id, email: updatedUser.email, username: updatedUser.username})
      }
      else {
        res.status(constants.SERVER_ERROR);
        throw new Error("Problem updating user");
      }
    }
    catch (error) {
      res.status(constants.SERVER_ERROR);
      throw new Error(`Problem updating user: ${error}`);
    }
  }
  else{
    res.status(constants.NOT_FOUND);
    throw new Error("User not found");
  }
});

//@desc Delete a User record
//@route DELETE /api/user/:id
//@access public
export const deleteUser = asyncHandler( async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);

  if (user){
    await User.deleteOne({_id: req.params.id});
    res.status(constants.SUCCESS).json({message: "User successfully deleted"});
  }
  else {
    res.status(constants.NOT_FOUND);
    throw new Error("User not found");
  }
});
