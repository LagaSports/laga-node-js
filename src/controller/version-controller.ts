import { Request, Response, NextFunction } from "express";
import pkg from '../../package.json' assert { type: "json" };

const getVersion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Heroku automatically sets these environment variables
        const commitHash = process.env.HEROKU_SLUG_COMMIT || 'unknown';
        const releaseVersion = process.env.HEROKU_RELEASE_VERSION || 'unknown';
        const releaseCreatedAt = process.env.HEROKU_RELEASE_CREATED_AT;
        const githubUrl = pkg.repository.url.replace('git+', '').replace('.git', '');

        res.status(200).json({
            data: {
                version: pkg.version,
                commit: {
                    hash: commitHash,
                    url: commitHash !== 'unknown' 
                        ? `${githubUrl}/commit/${commitHash}`
                        : null
                },
                release: {
                    version: releaseVersion,
                    createdAt: releaseCreatedAt || new Date().toISOString()
                },
                environment: process.env.NODE_ENV || 'development'
            }
        });
    } catch (error) {
        next(error);
    }
};

export default { getVersion };
