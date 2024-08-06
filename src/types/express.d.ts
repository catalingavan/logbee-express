import LoggerContext from '../LoggerContext';

declare module 'express-serve-static-core' {
    interface Request {
        logbeeContext?: LoggerContext;
    }
}
