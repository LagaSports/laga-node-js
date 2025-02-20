import { Router } from "express";
import versionController from "../controller/version-controller.js";
import { getContainer } from "../ioc/container.js";
import { AuthController } from "../controller/auth-controller.js";
import { TournamentController } from "../controller/tournament-controller.js";
import { PlayerController } from "../controller/player-controller.js";
import { MatchController } from "../controller/match-controller.js";
import { PadelCourtController } from "../controller/padel-court-controller.js";

export const publicRouter: Router = Router();

const container = getContainer();
const authController: AuthController = container.resolve('authController');
const tournamentController: TournamentController = container.resolve('tournamentController');
const playerController: PlayerController = container.resolve('playerController');
const matchController: MatchController = container.resolve('matchController');  
const padelCourtController: PadelCourtController = container.resolve('padelCourtController');

publicRouter.post('/register', authController.register);
publicRouter.get('/version', versionController.getVersion);
publicRouter.get('/users', authController.getUsers);
publicRouter.post('/validate-token', authController.validateToken);
publicRouter.get('/tournaments', tournamentController.getTournamentsByCreatorId);
publicRouter.get('/tournaments/recent', tournamentController.getRecentTournaments);
publicRouter.get('/tournaments/:id', tournamentController.findById);
publicRouter.get('/tournaments/:id/leaderboard', tournamentController.findLeaderboardByTournamentId);
publicRouter.post('/tournaments', tournamentController.create);
publicRouter.post('/players', playerController.create);
publicRouter.patch('/tournaments/match-scores/bulk', matchController.updateMatchScores);
publicRouter.post('/tournaments/next-round', matchController.generateNextRoundMatches);
publicRouter.get('/padel-courts', padelCourtController.findAll);


