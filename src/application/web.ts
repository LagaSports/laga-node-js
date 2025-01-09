import express, { Application } from "express";
import cors from 'cors';
import { errorMiddleware } from "../middleware/error-middleware.js";
import { publicRouter } from "../router/public-api.js";

export const web: Application = express();

// Add CORS middleware before other middleware
web.use(cors({
    origin: true, // Allow all origins in development
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// Handle preflight requests
web.options('*', cors());

web.use(express.json());
web.use(publicRouter);
web.use(errorMiddleware); 