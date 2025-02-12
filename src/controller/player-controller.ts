import { ApiResponseBuilder } from "../response/api-response.js";
import { PlayerService } from "../service/player-service.js";
import { Request, Response, NextFunction } from "express";

export class PlayerController {

    constructor(private readonly playerService: PlayerService) {

    }

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log(req.body);
            const result = await this.playerService.create(req.body);
            res.status(200).json(ApiResponseBuilder.success(result, "Player created successfully"));
        } catch (e) {
            next(e);
        }
    }
}