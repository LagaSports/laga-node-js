import { Request, Response, NextFunction } from "express";

const getVersion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Heroku automatically sets these environment variables
        const commitHash = process.env.SOURCE_VERSION || 'unknown';

        res.status(200).json({
            data: {
                commit: {
                    hash: commitHash,
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

export default { getVersion };
