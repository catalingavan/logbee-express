# @logbee/express

An ExpressJS middleware which saves the HTTP properties, exceptions and logs to [logbee.net](https://logbee.net).

## Install

```shell
npm install @logbee/express
```

## Usage

1. Require/import the logbee library

```javascript
const { logbee } = require('@logbee/express');
```

or

```javascript
import { logbee } from '@logbee/express';
```

2. Register the logbee middleware

```javascript
const app = express();

app.use(logbee.middleware({
    organizationId: '_OrganizationId_',
    applicationId: '_ApplicationId_',
    logbeeApiUri: 'https://api.logbee.net' // or the on-premises logbee endpoint
}));

app.get("/", (req, res) => {
    res.send('Hello World!');
});

// register the exception middleware after the routes declaration
app.use(logbee.exceptionMiddleware());

app.listen(3000, () => {
    console.log('Server is running');
});
```

## Using the logger

logbee creates a `logger` object that can be accessed using the `logbee.logger(req)` function.

Log messages can be created using one of the following `logger` methods: `trace`, `debug`, `info`, `warn`, `error`, `critical`

```javascript
app.get("/", (req, res) => {
    const logger = logbee.logger(req);
    logger?.info('An info message', 'with', 'multiple', 'args', { 'foo': 'bar' });

    res.send('Hello World!');
});
```

## Logging files

Files can be logged using the  `logger.logAsFile(content, fileName)` method. 

```javascript
app.get("/", (req, res) => {
    const logger = logbee.logger(req);
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
```

## Configuration

`logbee.middleware` accepts the following configuration options:

### `logbeeApiUri`

The logbee endpoint where the logs will be saved. Default: `https://api.logbee.net`.

### `shouldLogRequestBody(req)`

Determines if the `request.body` should be logged or not. Default: `true`.

```javascript
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(logbee.middleware({
    shouldLogRequestBody: function(req) {
        return true;
    }
}));
```

### `shouldLogResponseBody(req, res)`

Determines if the response body should be logged or not. By default, all the `application/json` responses are logged.

```javascript
app.use(logbee.middleware({
    shouldLogResponseBody: function(req, res) {
        const contentType = res.getHeader('content-type')?.toString()?.toLowerCase() ?? "";
        return ['application/json'].some(item => {
            return contentType.indexOf(item) > -1;
        });
    }
}));
```

### `shouldLogRequest(req, res)`

Determines if the current request should be logged or not. Default: `true`.

```javascript
app.use(logbee.middleware({
    shouldLogRequest: function(req, res) {
        return true;
    }
}));
```

### User-interface

<table><tr><td>
    <img alt="User interface" src="https://github.com/user-attachments/assets/bcc526f0-878f-4ff6-ac78-5aac2435668f" />
</td></tr></table>


