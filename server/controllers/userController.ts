import { Request, Response } from 'express';

//@desc Check if a username exists
//@route POST /api/userServices/does-username-exist:id
//@access public
const checkUsername = (req: Request, res: Response) => {
  res.status(200).json({ working: `Get/Check if user exists ${req.params.id}` });
}

//@desc Get a single User record
//@route GET /api/userServices/:id
//@access public
const getUser = (req: Request, res: Response) => {
  res.status(200).json({ working: `Get if user exists ${req.params.id}` });
}

//@desc Update a User record
//@route PUT /api/userServices/update-user:id
//@access public
const updateUser = (req: Request, res: Response) => {
  res.status(200).json({ working: `Update User ${req.params.id}`});
}

//@desc Delete a User record
//@route DELETE /api/userServices/delete-user:id
//@access public
const deleteUser = (req: Request, res: Response) => {
  res.status(200).json({ working: `Delete User ${req.params.id}`});
}

module.exports = { checkUsername, getUser, updateUser, deleteUser };