import winston, { error, info, LeveledLogMethod } from "winston";

const logger = winston.createLogger({
  level: "debug",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: `logs/agent.log`,
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
