import { Request, Response, NextFunction } from "express";

const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.status(200).json({
            data: "OK Register"
        });
    } catch (error) {
        next(error);
    }
}

export default { register };

