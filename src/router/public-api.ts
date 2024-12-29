import { Router } from "express";
import authController from "../controller/auth-controller.js";
import versionController from "../controller/version-controller.js";

export const publicRouter: Router = Router();

publicRouter.get('/register', authController.register);
publicRouter.get('/version', versionController.getVersion);

