const express = require('express');
const { logbee } = require('../');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(logbee.middleware({
    organizationId: '0337cd29-a56e-42c1-a48a-e900f3116aa8',
    applicationId: '4f729841-b103-460e-a87c-be6bd72f0cc9',
    logbeeApiUri: 'https://api.logbee.net'
}));

app.get("/", (req, res) => {
    const logger = logbee.logger(req);

    logger?.info('An info message', 'with', 'multiple', 'args', { 'foo': 'bar' });

    logger?.logAsFile(
        '<?xml version="1.0" encoding="UTF-8"?>\
         <note>\
            <to>Tove</to>\
            <from>Jani</from>\
            <heading>Reminder</heading>\
            <body>Don\'t forget me this weekend!</body>\
         </note>', 'reminder.xml');

    res.send('Hello World!');
});

app.use(logbee.exceptionMiddleware());

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});