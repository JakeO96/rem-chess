import { Request, Response } from 'express';

//@desc Create a User
//@route POST /api/auth/create-user
//@access public
const createUser = (req: Request, res: Response) => {
  const {}
  res.status(201).json({ working: "Create a user" });

}

module.exports = { createUser };