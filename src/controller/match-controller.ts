import { Request, Response, NextFunction } from "express";
import { MatchService } from "../service/match-service.js";
import { ApiResponseBuilder } from "../response/api-response.js";

export class MatchController {
    constructor(private matchService: MatchService) {}

    createMatch = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { tournamentId, round } = req.body;
            const result = await this.matchService.createMatch(Number(tournamentId), Number(round));
            res.status(201).json(ApiResponseBuilder.created(result, "Match created successfully"));
        } catch (e) {
            next(e);
        }
    }

    getMatchesByTournament = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tournamentId = Number(req.params.tournamentId);
            const matches = await this.matchService.getMatchesByTournament(tournamentId);
            res.status(200).json(ApiResponseBuilder.success(matches, "Matches retrieved successfully"));
        } catch (e) {
            next(e);
        }
    }

    getMatchById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const matchId = Number(req.params.id);
            const match = await this.matchService.getMatchById(matchId);
            res.status(200).json(ApiResponseBuilder.success(match, "Match retrieved successfully"));
        } catch (e) {
            next(e);
        }
    }

    updateMatchStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const matchId = Number(req.params.id);
            const { status } = req.body;
            const result = await this.matchService.updateMatchStatus(matchId, status);
            res.status(200).json(ApiResponseBuilder.success(result, "Match status updated successfully"));
        } catch (e) {
            next(e);
        }
    }

    updateMatchScores = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.matchService.updateMatchScoreBulkWithTransaction(req.body);
            res.status(200).json(ApiResponseBuilder.success(result, "Match score updated successfully"));
        } catch (e) {
            next(e);
        }
    }

    generateNextRoundMatches = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.matchService.generateMatchesWithTransaction(req.body);
            res.status(200).json(ApiResponseBuilder.success(result, "Next round matches generated successfully"));
        } catch (e) {
            next(e);
        }
    }
} 