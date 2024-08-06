export interface CreateRequestPayload {
    startedAt: string;
    httpProperties: HttpPropertiesPayload;
    logs?: LogMessagePayload[];
    exceptions?: ExceptionPayload[];
};

interface HttpPropertiesPayload {
    absoluteUri: URL;
    method: string;
    remoteAddress?: string;
    request: RequestPropertiesPayload;
    response: ResponsePropertiesPayload;
};

export interface RequestPropertiesPayload {
    headers?: { [key: string]: string };
    cookies?: { [key: string]: string };
    formData?: { [key: string]: string };
    claims?: { [key: string]: string };
    inputStream?: string;
}

interface ResponsePropertiesPayload {
    statusCode: number;
    headers?: { [key: string]: string };
    contentLength?: number;
}

export interface LogMessagePayload {
    logLevel: string;
    message: string;
    millisecondsSinceRequestStarted: number;
}

export interface ExceptionPayload {
    exceptionType: string;
    exceptionMessage: string;
}