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
  info(channel: LogChannel, message: string) {
    writeLog(channel, formatMessage("INFO", message));
  },

  warn(channel: LogChannel, message: string) {
    writeLog(channel, formatMessage("WARN", message));
  },

  error(channel: LogChannel, message: string) {
    writeLog(channel, formatMessage("ERROR", message));
  },
};
