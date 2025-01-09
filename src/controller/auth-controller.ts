import { Request, Response, NextFunction } from "express";
import { AuthService } from "../service/auth-service.js";
export class AuthController {

    constructor(private readonly authService: AuthService) {}
 
    register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.status(200).json({
                data: "OK"
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
    
}

