import { PadelCourt, PrismaClient } from "@prisma/client";

export class PadelCourtRepository {
    constructor(private prismaClient: PrismaClient) {}

    findAll = async (): Promise<PadelCourt[]> => {
        return await this.prismaClient.padelCourt.findMany({
            orderBy: {
                court_name: 'asc',
            },
        });
    }

    findById = async (id: number): Promise<PadelCourt | null> => {
        return await this.prismaClient.padelCourt.findUnique({
            where: { id },
        });
    }
}