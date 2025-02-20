import { asClass, asValue, createContainer, InjectionMode, AwilixContainer } from "awilix"
import { prismaClient } from "../application/database.js";
import { UserService } from "../service/user-service.js";
import { AuthController } from "../controller/auth-controller.js";
import { auth } from "../application/firebase.js";
import { AuthService } from "../service/auth-service.js";
import { TournamentService } from "../service/tournament-service.js";
import { TournamentController } from "../controller/tournament-controller.js";
import { TournamentRepository } from "../repository/tournament-repository.js";
import { UserRepository } from "../repository/user-repository.js";
import { PlayerService } from "../service/player-service.js";
import { PlayerRepository } from "../repository/player-repository.js";
import { MatchRepository } from "../repository/match-repository.js";
import { MatchService } from "../service/match-service.js";
import { MatchController } from "../controller/match-controller.js";
import { PlayerController } from "../controller/player-controller.js";
import { LeaderboardRepository } from "../repository/leaderboard-repository.js";
import { LeaderboardService } from "../service/leaderboard-service.js";
import { PadelCourtService } from "../service/padel-court-service.js";
import { PadelCourtRepository } from "../repository/padel-court-repository.js";
import { PadelCourtController } from "../controller/padel-court-controller.js";

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
            padelCourtController: asClass(PadelCourtController).singleton(),
            matchController: asClass(MatchController).singleton(),
            playerController: asClass(PlayerController).singleton(),
            userService: asClass(UserService).singleton(),
            tournamentService: asClass(TournamentService).singleton(),
            authService: asClass(AuthService).singleton(),
            leaderboardService: asClass(LeaderboardService).singleton(),
            playerService: asClass(PlayerService).singleton(),
            matchService: asClass(MatchService).singleton(),
            padelCourtService: asClass(PadelCourtService).singleton(),
            tournamentRepository: asClass(TournamentRepository).singleton(),
            userRepository: asClass(UserRepository).singleton(),
            playerRepository: asClass(PlayerRepository).singleton(),
            matchRepository: asClass(MatchRepository).singleton(),
            leaderboardRepository: asClass(LeaderboardRepository).singleton(),
            padelCourtRepository: asClass(PadelCourtRepository).singleton(),
        });
    }
    return containerInstance;
};
