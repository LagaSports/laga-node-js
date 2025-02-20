import { NextFunction, Request, Response } from "express";
import { PadelCourtService } from "../service/padel-court-service.js";

export class PadelCourtController {
    constructor(private padelCourtService: PadelCourtService) {}

    findAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const padelCourts = await this.padelCourtService.findAll();
            res.status(200).json({
                data: padelCourts,
            });
        } catch (error) {
            next(error);
        }
    }
}