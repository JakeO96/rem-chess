import { Request, Response } from 'express'
import { HttpStatusCode } from '../constants'
import asyncHandler from 'express-async-handler'
import Game from '../models/gameModel'
import User from '../models/userModel'
import type { ActiveUser } from '../models/userModel'

interface RequestWithUser extends Request {
  user?: ActiveUser;
}

//@desc Create a Game record
//@route POST /api/game/create-game
//@access private
const createGame = asyncHandler( async (req: RequestWithUser, res: Response) => {
  const opponent_username = req.body;
  if ( !opponent_username ) {
    res.status(HttpStatusCode.VALIDATION_ERROR);
    throw new Error("Missing required fields");
  }

  const opponent = await User.findOne({ opponent_username });
  if (!opponent) {
    res.status(HttpStatusCode.VALIDATION_ERROR);
    throw new Error("Opponent does not exist");
  }

  if (!req.user) {
    res.status(HttpStatusCode.UNAUTHORIZED);
    throw new Error("UNAUTHORIZED");
  }
  
  const hero_username = req.user.username;
  const hero = await User.findOne({ hero_username});
  if (!hero){
    res.status(HttpStatusCode.VALIDATION_ERROR);
    throw new Error("Opponent does not exist");
  }

  const hero_game = new Game({
    playerId: hero._id,
    opponentId: opponent._id,
    moves: [],
  });
  const opponent_game = new Game({
    playerId: opponent._id,
    opponentId: hero._id,
    moves: [],
  });
  await hero_game.save();
  await opponent_game.save();

  await User.findByIdAndUpdate(hero._id, { $push: { games: hero_game._id } });
  await User.findByIdAndUpdate(opponent._id, { $push: { games: opponent._id } });
  
  res.status(HttpStatusCode.RECORD_CREATED).json({ /** TODO */});
})

//@desc Get all Game records for a User
//@route GET /api/game/create-game
//@access private
const getAllGames = asyncHandler( async (req: RequestWithUser, res: Response) => {
  if(req.user) {
    const users = await Game.find({player_id: req.user.id});
    if (users) {
      res.status(HttpStatusCode.SUCCESS).json(users);
    }
    else {
      res.status(HttpStatusCode.NOT_FOUND);
      throw new Error("User not found");
    }
  }
})

//@desc Get a single Game record
//@route GET /api/game/:id
//@access public
const getGame = asyncHandler( async (req: Request, res: Response) => {
  const game = await Game.findById(req.params.id);
  if(game) {
    res.status(HttpStatusCode.SUCCESS).json(game);
  } 
  else {
    res.status(HttpStatusCode.NOT_FOUND);
    throw new Error("Game not found");
  }
});

//@desc Delete a Game record
//@route DELETE /api/game/:id
//@access privtae
const deleteGame = asyncHandler( async (req: RequestWithUser, res: Response) => {
  const game= await Game.findById(req.params.id);
  if (game){
    if(req.user && req.user.id) {
      if(game.playerId.toString() === req.user.id) {
        await Game.deleteOne({_id: req.params.id});
        res.status(HttpStatusCode.SUCCESS).json({message: "User successfully deleted"});
      }
      else {
        res.status(HttpStatusCode.FORBIDDEN)
        throw new Error("Forbidden action")
      }
    }
  }
  else {
    res.status(HttpStatusCode.NOT_FOUND);
    throw new Error("User not found");
  }
});

export { createGame, getAllGames, getGame, deleteGame }