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
const createGame = asyncHandler( async (req: Request, res: Response) => {
  const { player_id, opponent_id, moves} = req.body;
  if ( !player_id || !opponent_id|| !moves ) {
    res.status(HttpStatusCode.VALIDATION_ERROR);
    throw new Error("Missing required fields");
  }
  const game = new Game({
    player_id: player_id,
    opponent_id: opponent_id,
    moves: moves,
  });
  await game.save();

  await User.findByIdAndUpdate(player_id, { $push: { games: game._id } });
  
  res.status(HttpStatusCode.RECORD_CREATED).json({
    game_id: game._id, 
    player_id: player_id, 
    opponent_id: opponent_id, 
    moves: moves,});
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