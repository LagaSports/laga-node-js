import { Router } from "express";
import versionController from "../controller/version-controller.js";
import { getContainer } from "../ioc/container.js";
import { AuthController } from "../controller/auth-controller.js";
import { TournamentController } from "../controller/tournament-controller.js";

export const publicRouter: Router = Router();

const container = getContainer();
const authController: AuthController = container.resolve('authController');
const tournamentController: TournamentController = container.resolve('tournamentController');

publicRouter.get('/register', authController.register);
publicRouter.get('/version', versionController.getVersion);
publicRouter.post('/validate-token', authController.validateToken);
publicRouter.post('/tournament', tournamentController.create);

