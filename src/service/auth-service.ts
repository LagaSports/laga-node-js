import { Auth } from "firebase/auth";
import { ValidateTokenRequestDTO } from "../dto/ValidateTokenRequestDTO.js";
import { logger } from "../application/logging.js";
import { PrismaClient, User } from "@prisma/client";
import { ResponseError } from "../error/response-error.js";

export class AuthService {
    constructor(private readonly firebaseAuth: Auth, private readonly prismaClient: PrismaClient) {}
    
    async validateToken(payload: ValidateTokenRequestDTO): Promise<{
        uid: number;
        email: string | null;
        displayName: string | null;
    }> {
        try {
            if (!payload.token) {
                throw new ResponseError(400, "Token is required");
            }

            const user = await this.prismaClient.user.findFirst({
                where: { email: payload.token },
                select: {
                    id: true,
                    email: true,
                    name: true
                }
            });

            if (!user) {
                throw new ResponseError(404, "User not found");
            }

            return {
                uid: user.id,
                email: user.email,
                displayName: user.name
            };
        } catch (error) {
            if (error instanceof ResponseError) {
                throw error;
            }
            logger.error('Authentication error:', error);
            throw new ResponseError(401, "Authentication failed");
        }
    }
}
