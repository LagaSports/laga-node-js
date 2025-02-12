import { User } from "@prisma/client";

import { PrismaClient } from "@prisma/client";
import { RegisterRequestDTO } from "../dto/internal/Auth.js";

export class UserRepository {

    constructor(
        private prismaClient: PrismaClient,
    ) {}

    findById = async (id: number): Promise<User | null> => {
        return await this.prismaClient.user.findFirst({
            where: {
                id: id,
            },
        });
    }

    findByEmail = async (email: string): Promise<User | null> => {
        return await this.prismaClient.user.findFirst({
            where: { email },
        });
    }

    create = async (request: RegisterRequestDTO): Promise<User> => {
        return await this.prismaClient.user.create({
            data: {
                email: request.email,
                name: request.name,
                phone_number: request.phoneNumber,
            },
        });
    }

}