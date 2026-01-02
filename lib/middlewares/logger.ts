import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";

const createLogger = () => {
  const transports: winston.transport[] = [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf(
          ({ timestamp, level, message, ...meta }) =>
            `${timestamp} [${level}]: ${message} ${
              Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""
            }`
        )
      ),
    }),
  ];

  if (process.env.NODE_ENV === "development") {
    const logDirectory = path.join(process.cwd(), "logs");

    // Error logs - daily rotation, kept for 14 days
    transports.push(
      new DailyRotateFile({
        filename: path.join(logDirectory, "error-%DATE%.log"),
        datePattern: "YYYY-MM-DD",
        level: "error",
        maxSize: "20m",
        maxFiles: "14d",
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
      })
    );

    // Combined logs - daily rotation, kept for 14 days
    transports.push(
      new DailyRotateFile({
        filename: path.join(logDirectory, "combined-%DATE%.log"),
        datePattern: "YYYY-MM-DD",
        maxSize: "20m",
        maxFiles: "14d",
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
      })
    );

    // Short-lived logs - size-based rotation, kept for 3 days
    transports.push(
      new DailyRotateFile({
        filename: path.join(logDirectory, "recent-%DATE%.log"),
        datePattern: "YYYY-MM-DD-HH",
        maxSize: "10m", // Rotate after 10MB
        maxFiles: "3d", // Keep for 3 days
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
      })
    );

    // Warning logs - daily rotation
    transports.push(
      new DailyRotateFile({
        filename: path.join(logDirectory, "warn-%DATE%.log"),
        datePattern: "YYYY-MM-DD",
        level: "warn",
        maxSize: "20m",
        maxFiles: "7d",
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
      })
    );
  }

  return winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: winston.format.json(),
    transports,
    exitOnError: false,
  });
};

export const logger = createLogger();