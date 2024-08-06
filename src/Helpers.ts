import LogbeeConfig from "./LogbeeConfig";

class Helpers {
    private readonly DEFAULT_RESPONSE_FILE_NAME: string = 'Response.txt';

    wrapInTryCatch(fn: (...args: any[]) => void, ...args: any[]): any {
        try {
            return fn(...args);
        } catch (error) {
            this.internalLog('An error occurred:', error);
        }
    };

    async wrapInTryCatchAsync(fn: (...args: any[]) => void, ...args: any[]): Promise<any> {
        try {
            return await fn(...args);
        } catch (error) {
            this.internalLog('An error occurred:', error);
        }
    };

    internalLog(...data: any[]): void {
        try {
            LogbeeConfig.internalLog(...data);
        } catch (ex) {
            console.log(...data);
            console.warn(`LogbeeConfig.internalLog threw exception and we used console.log instead. Exception:${ex.stack}`);
        }
    };

    getResponseFileName(contentTypeResponseHeader: string): string {
        if (!contentTypeResponseHeader) {
            return this.DEFAULT_RESPONSE_FILE_NAME;
        }

        contentTypeResponseHeader = contentTypeResponseHeader.toLowerCase();

        if (contentTypeResponseHeader.indexOf("/json") > -1)
            return "Response.json";

        if (contentTypeResponseHeader.indexOf("/xml") > -1)
            return "Response.xml";

        if (contentTypeResponseHeader.indexOf("/html") > -1)
            return "Response.html";

        return this.DEFAULT_RESPONSE_FILE_NAME;
    };

    canReadResponseBody(contentTypeResponseHeader: string): boolean {
        if (!contentTypeResponseHeader) {
            // we don't know yet the response headers
            return true;
        }

        const value = contentTypeResponseHeader.toLowerCase();
        return LogbeeConfig.READ_RESPONSE_BODY_CONTENT_TYPES.some(item => {
            return value.indexOf(item) > -1;
        });
    };
}

export default new Helpers();
