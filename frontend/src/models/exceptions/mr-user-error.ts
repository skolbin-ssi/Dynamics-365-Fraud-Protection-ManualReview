import { MrError } from './mr-error';

/**
 * MrUserError is the model that assumes that message
 * from this exception can be showed to the user directly.
 * Meaning that e.displayMessage is a user friendly message
 */
export class MrUserError extends MrError {
    readonly isUserError = true;

    constructor(public readonly displayMessage: string, originalError: Error) {
        super(originalError.message);
    }
}
