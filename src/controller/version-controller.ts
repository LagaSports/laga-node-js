import { Request, Response, NextFunction } from "express";

const getVersion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Heroku automatically sets these environment variables
        const commitHash = process.env.GIT_COMMIT_HASH || 'unknown';

        res.status(200).json({
            data: {
                commit: {
                    hash: "fklsjflkj",
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

export default { getVersion };
