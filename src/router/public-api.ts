import { Router } from "express";
import authController from "../controller/auth-controller.js";

export const publicRouter: Router = Router();

publicRouter.get('/register', authController.register);
