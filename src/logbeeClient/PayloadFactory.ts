import { Request, Response } from 'express';
import LoggerContext from '../LoggerContext';
import { CreateRequestPayload, RequestPropertiesPayload, LogMessagePayload } from './Payloads';

class PayloadFactory {
    buildCreateRequestPayload(request: Request, response: Response, requestProperties: RequestPropertiesPayload, loggerContext: LoggerContext): CreateRequestPayload {
        const logs = this.buildLogs(loggerContext);
        return {
            startedAt: loggerContext.createdAt.toISOString(),
            httpProperties: {
                absoluteUri: new URL(`${request.protocol}://${request.get('host')}${request.originalUrl}`),
                method: request.method,
                request: requestProperties,
                response: {
                    statusCode: response.statusCode,
                    headers: this.toDictionary(response.getHeaders())
                }
            },
            logs: logs,
            exceptions: loggerContext.getErrors()
        };
    };

    buildRequestProperties(request: Request, logRequestBody: boolean): RequestPropertiesPayload {
        let requestBody = undefined;
        if (logRequestBody) {
            const hasBody = !!request.body && (!!request.headers?.['content-length'] || !!request.headers['transfer-encoding']);
            requestBody = !hasBody ? undefined :
                typeof request.body === 'string' ? request.body : JSON.stringify(request.body);

            requestBody = requestBody === '{}' ? undefined : requestBody;
        }

        return {
            headers: this.toDictionary(request.headers),
            cookies: this.toDictionary(request.cookies),
            inputStream: requestBody
        };
    };

    private buildLogs(loggerContext: LoggerContext): LogMessagePayload[] {
        const logs = loggerContext.getLogs();
        return logs.map(item => ({
            logLevel: item.logLevel,
            message: item.message,
            millisecondsSinceRequestStarted: Math.max(0, item.createdAt.getTime() - loggerContext.createdAt.getTime())
        }));
    }

    private toDictionary(collection?: NodeJS.Dict<number | string | string[]>): { [key: string]: string } | undefined {
        if (!collection) {
            return;
        }

        const result: { [key: string]: string } = {};

        for (const key in collection) {
            if (!Object.prototype.hasOwnProperty.call(collection, key)) {
                continue;
            }

            const value = collection[key];
            const dictValue = Array.isArray(value) ? value.join(', ') :
                typeof value === 'string' ? value :
                    value?.toString() || "";

            result[key] = dictValue;
        }

        return result;
    };
}

export default new PayloadFactory();