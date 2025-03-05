import winston, { error, info, LeveledLogMethod } from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.simple(),
  transports: [
    new winston.transports.Console({}),
    new winston.transports.File({
      filename: `logs/agent.log`,
      level: "debug",
    }),
  ],
});

export function useLogger() {
  const info = (message: string, ...meta: any[]) => {
    logger.info(message, meta);
  };

  const debug = (message: string, ...meta: any[]) => {
    logger.debug(message, meta);
  };

  const error = (message: string, ...meta: any[]) => {
    logger.error(message, meta);
  };

  return {
    info,
    debug,
    error,
  };
}
