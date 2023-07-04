import { Request, Response } from 'express';
import { constants } from '../constants';
import asyncHandler from 'express-async-handler';
import User from "../models/userModel";

//@desc Get a single User record
//@route GET /api/user/:id
//@access public
const getAllUsers = asyncHandler( async (req: Request, res: Response) => {
  const users = await User.find({});
  if (users) {
    res.status(constants.SUCCESS).json(users);
  }
  else {
    res.status(constants.NOT_FOUND);
    throw new Error("User not found");
  }
});

//@desc Get a single User record
//@route GET /api/user/:id
//@access public
const getUser = asyncHandler( async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if(user) {
    res.status(constants.SUCCESS).json(user);
  } 
  else {
    res.status(constants.NOT_FOUND);
    throw new Error("User not found");
  }
});

//@desc Update a User record
//@route PUT /api/user/:id
//@access public
const updateUser = asyncHandler( async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);

  if(user) {
    res.status(constants.SUCCESS).json(await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ));
  }
  else {
    res.status(constants.NOT_FOUND);
    throw new Error("User not found");
  }
});

//@desc Delete a User record
//@route DELETE /api/user/:id
//@access public
const deleteUser = asyncHandler( async (req: Request, res: Response) => {
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

module.exports = { getAllUsers, getUser, updateUser, deleteUser };