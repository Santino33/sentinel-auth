import fs from "fs";
import path from "path";
import { LogChannel } from "./log.types";

const logDir = path.join(process.cwd(), "logs");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

function getLogFile(channel: LogChannel) {
  return path.join(logDir, `${channel}.log`);
}

function formatMessage(level: string, message: string) {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] ${message}\n`;
}

function writeLog(channel: LogChannel, entry: string) {
  fs.appendFile(getLogFile(channel), entry, (err) => {
    if (err) {
      console.error("Log write failed:", err);
    }
  });
}

export const logger = {
  info(channel: string, ...messages: string[]) {
    writeLog(channel as LogChannel, formatMessage("INFO", messages.join(" | ")));
  },

  warn(channel: string, ...messages: string[]) {
    writeLog(channel as LogChannel, formatMessage("WARN", messages.join(" | ")));
  },

  error(channel: string, ...messages: string[]) {
    writeLog(channel as LogChannel, formatMessage("ERROR", messages.join(" | ")));
  },
};

export type Logger = typeof logger;
