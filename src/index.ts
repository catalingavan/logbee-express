import { middleware, exceptionMiddleware } from './middleware/LogbeeMiddleware';
import { LogLevel } from './models/LogLevel';
import { Request } from 'express';
import LoggerContext from './LoggerContext';
import LogbeeConfig from './LogbeeConfig';

const logger = function (req: Request): LoggerContext | null {
    return req.logbeeContext;
};

const logbee = {
    middleware,
    exceptionMiddleware,
    logger,
    CONFIG: LogbeeConfig
};

export { logbee, LogLevel };