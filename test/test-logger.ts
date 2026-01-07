import { logger } from "../src/utils/logger";
import { LogChannel } from "../src/utils/log.types";

logger.info(LogChannel.APP, "testing the logger");
logger.error(LogChannel.APP, "testing the logger");
logger.warn(LogChannel.APP, "testing the logger");
logger.info(LogChannel.DB, "testing the logger");
logger.error(LogChannel.DB, "testing the logger");
logger.warn(LogChannel.DB, "testing the logger");
logger.info(LogChannel.AUTH, "testing the logger");
logger.error(LogChannel.AUTH, "testing the logger");
logger.warn(LogChannel.AUTH, "testing the logger");
logger.info(LogChannel.REDIS, "testing the logger");
logger.error(LogChannel.REDIS, "testing the logger");
logger.warn(LogChannel.REDIS, "testing the logger");

