import { Request, Response, NextFunction } from "express";
import { TournamentService } from "../service/tournament-service.js";
import { ApiResponseBuilder } from "../response/api-response.js";
import { Leaderboard, Tournament } from "@prisma/client";
import { GetTournamentByCreatorRequestDTO } from "../dto/api/GetTournamentByCreatorRequestDTO.js";
import { LeaderboardDTO, TournamentDTO } from "../dto/internal/TournamentDTO.js";
import { LeaderboardService } from "../service/leaderboard-service.js";

export class TournamentController {
    constructor(
        private readonly tournamentService: TournamentService, 
        private readonly leaderboardService: LeaderboardService
    ) {}

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result: Tournament = await this.tournamentService.create(req.body);
            res.status(201).json(ApiResponseBuilder.created(result, "Tournament created successfully"));
        } catch (e) {
            next(e);
        }
    }

    getTournamentsByCreatorId = async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log(req);
            const getTournamentByCreatorRequestDTO: GetTournamentByCreatorRequestDTO = {
                creatorId: Number(req.query.creatorId),
            };
            console.log(getTournamentByCreatorRequestDTO);
            const result: TournamentDTO[] = await this.tournamentService.getTournamentsByCreatorId(getTournamentByCreatorRequestDTO);
            res.status(200).json(ApiResponseBuilder.success(result, "Tournaments retrieved successfully"));
        } catch (e) {
            next(e);
        }
    }

    findById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tournamentId = Number(req.params.id);
            const result: TournamentDTO = await this.tournamentService.findById(tournamentId);

            res.status(200).json(ApiResponseBuilder.success(result, "Tournament retrieved successfully"));
        } catch (e) {
            next(e);
        }
    }

    findLeaderboardByTournamentId = async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log(req.params.id, "<<< parmas");
            const tournamentId = Number(req.params.id);
            const result: LeaderboardDTO[] = await this.leaderboardService.findLeaderboardByTournamentId(tournamentId);
            res.status(200).json(ApiResponseBuilder.success(result, "Leaderboard retrieved successfully"));
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