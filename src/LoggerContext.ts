import { LogLevel } from './models/LogLevel';
import { LogMessage } from './models/LogMessage';
import { FileContent } from './models/FileContent';
import { ExceptionPayload } from './logbeeClient/Payloads';
import helpers from './Helpers';

class LoggerContext {
    private logs: LogMessage[];
    private errors: ExceptionPayload[];
    private files: FileContent[];
    createdAt: Date;

    constructor() {
        this.logs = [];
        this.errors = [];
        this.files = [];
        this.createdAt = new Date();
    }

    log(level: LogLevel, ...data: any): void {
        this.logInternal(level, ...data);
    }
    trace(...data: any[]): void {
        this.logInternal(LogLevel.Trace, ...data);
    }
    debug(...data: any[]): void {
        this.logInternal(LogLevel.Debug, ...data);
    }
    info(...data: any[]): void {
        this.logInternal(LogLevel.Information, ...data);
    }
    warn(...data: any[]): void {
        this.logInternal(LogLevel.Warning, ...data);
    }
    error(...data: any[]): void {
        this.logInternal(LogLevel.Error, ...data);
    }
    critical(...data: any[]): void {
        this.logInternal(LogLevel.Critical, ...data);
    }

    private logInternal(level: LogLevel, ...data: any[]): void {
        const values = [];

        helpers.wrapInTryCatch(() => {
            for (var i = 0, len = data.length; i < len; i++) {
                const value = data[i];
                const isError = value && value.stack && value.message;

                const valueAsStr =
                    isError ? value.stack.toString() :
                        typeof value === 'string' ? value :
                            JSON.stringify(value);

                values.push(valueAsStr);

                if (isError) {
                    this.errors.push({
                        exceptionType: value.name ?? 'Error',
                        exceptionMessage: value.message
                    });
                }
            }
        });

        if (values.length) {
            this.logs.push(new LogMessage(level, values.join(' ')));
        }
    };

    public logAsFile(content: string | Uint8Array | Buffer, fileName: string): void {
        if (!content) {
            return;
        }

        helpers.wrapInTryCatch(() => {
            const fileContent: Buffer =
                typeof content === 'string' ? Buffer.from(content, 'utf8') :
                    content instanceof Uint8Array ? Buffer.from(content) :
                        Buffer.isBuffer(content) ? content :
                            null;

            if (!fileContent) {
                return;
            }

            this.files.push(new FileContent(fileName ?? "File", fileContent));
        });
    }

    getLogs(): LogMessage[] {
        return this.logs;
    }

    getErrors(): ExceptionPayload[] {
        return this.errors;
    }

    getFiles(): FileContent[] {
        return this.files;
    }
}

export default LoggerContext;