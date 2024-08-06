export class FileContent {
    fileName: string;
    content: Buffer;

    constructor(fileName: string, content: Buffer) {
        this.fileName = fileName;
        this.content = content;
    }
}