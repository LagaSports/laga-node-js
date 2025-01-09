import { Request, Response, NextFunction } from "express";
import { TournamentService } from "../service/tournament-service.js";
import { CreateTournamentRequestDTO } from "../dto/CreateTournamentRequestDTO.js";
import { ApiResponseBuilder } from "../response/api-response.js";
import { Tournament } from "@prisma/client";

export class TournamentController {
    constructor(private readonly tournamentService: TournamentService) {}

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result: Tournament = await this.tournamentService.create(req.body);
            res.status(201).json(ApiResponseBuilder.created(result, "Tournament created successfully"));
        } catch (e) {
            next(e);
        }
    }

    // async getAll(req: Request, res: Response, next: NextFunction) {
    //     try {
    //         const tournaments = await this.tournamentService.getAll();
    //         res.status(200).json(ApiResponseBuilder.success(tournaments, "Tournaments retrieved successfully"));
    //     } catch (e) {
    //         next(e);
    //     }
    // }

    // async delete(req: Request, res: Response, next: NextFunction) {
    //     try {
    //         const result = await this.tournamentService.delete(req.params.id);
    //         res.status(200).json(ApiResponseBuilder.success(result, "Tournament deleted successfully"));
    //     } catch (e) {
    //         next(e);
    //     }
    // }
}