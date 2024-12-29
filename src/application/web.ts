import express, { Application } from "express";
import { errorMiddleware } from "../middleware/error-middleware.js";
import { publicRouter } from "../router/public-api.js";

export const web: Application = express();
web.use(express.json());
web.use(publicRouter);
web.use(errorMiddleware); 