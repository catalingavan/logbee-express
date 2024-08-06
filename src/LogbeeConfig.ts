class LogbeeConfig {
    static internalLog: (...data: any[]) => void = (...data) => {
        console.log('Logbee:', ...data);
    };

    static READ_RESPONSE_BODY_CONTENT_TYPES = [
        'application/json',
        'application/xml',
        'text/html',
        'text/plain',
        'text/xml'
    ];
}

export default LogbeeConfig;