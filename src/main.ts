import { logger } from "./application/logging.js";
import { web } from "./application/web.js";

const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;

web.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
}); 