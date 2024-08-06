import { Request, Response, NextFunction } from 'express';
import LoggerContext from '../LoggerContext';
import payloadFactory from '../logbeeClient/PayloadFactory';
import LogbeeClient from '../logbeeClient/LogbeeClient';
import helpers from '../Helpers';

interface Config {
    organizationId: string;
    applicationId: string;
    logbeeApiUri?: string;
    shouldLogResponseBody?: (req: Request, res: Response) => boolean;
    shouldLogRequestBody?: (req: Request) => boolean;
    shouldLogRequest?: (req: Request, res: Response) => boolean;
}

const defaultConfig: Partial<Config> = {
    logbeeApiUri: 'https://api.logbee.net',
    shouldLogResponseBody: (req, res) => {
        const contentType = res.getHeader('content-type')?.toString()?.toLowerCase() ?? "";
        return ['application/json'].some(item => {
            return contentType.indexOf(item) > -1;
        });
    },
    shouldLogRequestBody: () => true,
    shouldLogRequest: (req, res) => true
};

class LogbeeMiddleware {
    private client: LogbeeClient;
    private config: Config;

    constructor(config: Config) {
        this.config = {
            ...defaultConfig,
            ...config
        };

        this.client = new LogbeeClient({
            organizationId: this.config.organizationId,
            applicationId: this.config.applicationId,
            baseURL: this.config.logbeeApiUri!
        });
    }

    public middleware() {
        return (req: Request, res: Response, next: NextFunction) => {
            req.logbeeContext = new LoggerContext();

            const logRequestBody = helpers.wrapInTryCatch(() => this.config.shouldLogRequestBody(req));
            const requestProperties = payloadFactory.buildRequestProperties(req, logRequestBody);

            const originalWrite = res.write;
            const originalSend = res.send;
            const originalEnd = res.end;
            const chunks: Buffer[] = [];

            res.write = function (chunk: any, ...args: any[]): boolean {
                if (!!chunk) {
                    helpers.wrapInTryCatch(() => {
                        if (helpers.canReadResponseBody(res.getHeader('content-type')?.toString())) {
                            const data: Buffer = Buffer.isBuffer(chunk) ?
                                chunk : Buffer.from(chunk);

                            if (data) {
                                chunks.push(data);
                            }
                        }
                    });
                }

                return originalWrite.apply(res, [chunk, ...args]);
            };

            res.send = function (body?: any) {
                if (!!body) {
                    helpers.wrapInTryCatch(() => {
                        if (helpers.canReadResponseBody(res.getHeader('content-type')?.toString())) {
                            const data: Buffer = typeof body === 'string' ?
                                Buffer.from(body) : Buffer.isBuffer(body) ?
                                    body : typeof body === 'object' ?
                                        Buffer.from(JSON.stringify(body)) : null;

                            if (data) {
                                chunks.push(data);
                            }
                        };
                    });
                }

                return originalSend.call(this, body);
            };

            res.end = function (chunk: any, ...args: any[]): Response<any, Record<string, any>> {
                if (!!chunk) {
                    helpers.wrapInTryCatch(() => {
                        if (helpers.canReadResponseBody(res.getHeader('content-type')?.toString())) {
                            const data: Buffer = Buffer.isBuffer(chunk) ?
                                chunk : Buffer.from(chunk);

                            if (data) {
                                chunks.length = 0;
                                chunks.push(data);
                            }
                        }
                    });
                }

                return originalEnd.apply(res, [chunk, ...args]) as Response<any, Record<string, any>>;
            };

            res.on('finish', async () => {
                const shouldLog = helpers.wrapInTryCatch(() => this.config.shouldLogRequest(req, res));
                if (!shouldLog) {
                    return;
                }

                const logResponseBody = helpers.wrapInTryCatch(() => this.config.shouldLogResponseBody(req, res));
                if (logResponseBody && chunks.length) {
                    const fileName = helpers.getResponseFileName(res.getHeader('content-type')?.toString());
                    req.logbeeContext.logAsFile(Buffer.concat(chunks), fileName);
                }

                await helpers.wrapInTryCatchAsync(async () => {
                    const payload = payloadFactory.buildCreateRequestPayload(req, res, requestProperties, req.logbeeContext);
                    await this.client.createRequest(payload, req.logbeeContext.getFiles());
                });
            });

            next();
        };
    }

    public static exceptionMiddleware() {
        return (err: any, req: Request, res: Response, next: NextFunction) => {
            req.logbeeContext?.error(err);
            next(err);
        };
    }
}

export function middleware(config: Config) {
    const instance = new LogbeeMiddleware(config);
    return instance.middleware();
}

export function exceptionMiddleware() {
    return LogbeeMiddleware.exceptionMiddleware();
}