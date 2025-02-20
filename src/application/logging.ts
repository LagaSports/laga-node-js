import winston from "winston";

export const logger: winston.Logger = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    transports: [
        new winston.transports.Console({})
    ],
}); 