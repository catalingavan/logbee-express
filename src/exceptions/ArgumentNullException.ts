class ArgumentNullException extends Error {
    constructor(paramName?: string) {
        const message = !!paramName ? ArgumentNullException.errorMessage(paramName) : undefined;

        super(message)
        this.name = 'ArgumentNullException'
    }

    private static errorMessage(paramName: string): string {
        return `Argument ${paramName} is null or empty`;
    }
}

export default ArgumentNullException;
