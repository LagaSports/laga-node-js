import { Request, Response, NextFunction } from "express";
import { AuthService } from "../service/auth-service.js";
export class AuthController {

    constructor(private readonly authService: AuthService) {}
 
    register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userData = await this.authService.register(req.body); 
            res.status(200).json({
                data: userData
            })
        } catch (error) {
            next(error);
        }
    }

    validateToken = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userData = await this.authService.validateToken(req.body);
            res.status(200).json({
                data: userData
            });
        } catch (error) {
            next(error);
        }
    }

    getUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const email = req.query.email as string;
            const user = await this.authService.getUserByEmail(email);
            res.status(200).json({
                data: user
            });
        } catch (error) {
            next(error);
        }
    }

    getVersion = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const version = "sfjslkfj";
            res.status(200).json({
                data: version
            });
        } catch (error) {
            next(error);
        }
    }
}

