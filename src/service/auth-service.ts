import { Auth } from "firebase/auth";
import { ValidateTokenRequestDTO } from "../dto/ValidateTokenRequestDTO.js";
import { logger } from "../application/logging.js";
import { PrismaClient, User } from "@prisma/client";
import { ResponseError } from "../error/response-error.js";
import { UserRepository } from "../repository/user-repository.js";
import { UserDTO } from "../dto/internal/UserDTO.js";
import { RegisterRequestDTO } from "../dto/internal/Auth.js";
import { validate } from "../validation/validation.js";
import { userRegistrationSchema } from "../validation/auth.js";
export class AuthService {
    constructor(private readonly firebaseAuth: Auth, private readonly prismaClient: PrismaClient, private readonly userRepository: UserRepository) {}
    

    async register(request: RegisterRequestDTO): Promise<UserDTO> {
        validate(userRegistrationSchema, request);

        const user = await this.userRepository.create(request);
        return {
            id: user.id,
            email: user.email ?? '',
            name: user.name ?? '',
            phoneNumber: user.phone_number ?? ''
        };
    }

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

    async getUserByEmail(email: string): Promise<UserDTO | null> {
        try {
            const user: User | null = await this.userRepository.findByEmail(email);
            console.log(user, "<< user");
            return {
                id: user?.id ?? 0,
                email: user?.email ?? '',
                name: user?.name ?? '',
                phoneNumber: user?.phone_number ?? ''
            };
        } catch (error) {
            if (error instanceof ResponseError) {
                throw error;
            }
            throw new ResponseError(500, "Internal server error");
        }
    }
}