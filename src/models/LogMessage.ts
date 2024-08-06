import { LogLevel } from "./LogLevel";

export class LogMessage {
    logLevel: LogLevel;
    message: string;
    createdAt: Date;

    constructor(logLevel: LogLevel, message: string) {
        this.logLevel = logLevel;
        this.message = message;
        this.createdAt = new Date();
    }
}