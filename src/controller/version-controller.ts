import { Request, Response, NextFunction } from "express";

const getVersion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.status(200).json({
            data: {
                commitHash: process.env.GIT_COMMIT_HASH || 'unknown',
                deployedAt: process.env.DEPLOYED_AT || new Date().toISOString(),
            }
        });
    } catch (error) {
        next(error);
    }
};

export default { getVersion };
