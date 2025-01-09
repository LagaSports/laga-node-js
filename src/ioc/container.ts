import { asClass, asValue, createContainer, InjectionMode, AwilixContainer } from "awilix"
import { prismaClient } from "../application/database.js";
import { UserService } from "../service/user-service.js";
import { AuthController } from "../controller/auth-controller.js";
import { auth } from "../application/firebase.js";
import { AuthService } from "../service/auth-service.js";
import { TournamentService } from "../service/tournament-service.js";
import { TournamentController } from "../controller/tournament-controller.js";
import { TournamentRepository } from "../repository/tournament-repository.js";

let containerInstance: AwilixContainer;

export const getContainer = () => {
    if (!containerInstance) {
        containerInstance = createContainer({
            injectionMode: InjectionMode.CLASSIC
        });

        containerInstance.register({
            prismaClient: asValue(prismaClient),
            firebaseAuth: asValue(auth),
            authController: asClass(AuthController).singleton(),
            tournamentController: asClass(TournamentController).singleton(),
            userService: asClass(UserService).singleton(),
            tournamentService: asClass(TournamentService).singleton(),
            authService: asClass(AuthService).singleton(),
            tournamentRepository: asClass(TournamentRepository).singleton(),
        });
    }
    return containerInstance;
};
