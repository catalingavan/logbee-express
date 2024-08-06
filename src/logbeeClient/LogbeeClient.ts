import axios, { AxiosInstance } from 'axios';
import { CreateRequestPayload } from './Payloads';
import { FileContent } from '../models/FileContent';
import helpers from '../Helpers';
import FormData = require('form-data');

interface Config {
    organizationId: string;
    applicationId: string;
    baseURL: string;
}

class LogbeeClient {
    private client: AxiosInstance;
    private config: Config;

    constructor(config: Config) {
        this.config = config;

        this.client = axios.create({
            baseURL: config.baseURL
        });
    }

    async createRequest(payload: CreateRequestPayload, files: FileContent[]): Promise<void> {
        const reqPayload = {
            integrationClient: {
                name: 'logbee-net-express',
                version: '0.0.1'
            },
            organizationId: this.config.organizationId,
            applicationId: this.config.applicationId,
            ...payload
        };

        const formData = new FormData();
        formData.append('RequestLog', JSON.stringify(reqPayload));

        if (files && files.length) {
            files.forEach(file => {
                formData.append('files', file.content, file.fileName);
            });
        }

        this.client
            .post('/request-logs', formData, {
                headers: {
                    ...formData.getHeaders()
                }
            })
            .catch(err => {
                helpers.internalLog(`Request to ${this.config.baseURL} was unsuccessful`, err.response?.data);
            });
    }
}

export default LogbeeClient;
