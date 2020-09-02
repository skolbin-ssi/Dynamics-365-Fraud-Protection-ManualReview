export class BaseModel {
    protected define<T = any>(typeToCase: T, value?: any): T {
        function getDefault() {
            switch (typeof typeToCase) {
                case 'string':
                    return '-';
                case 'number':
                    return 0;
                case 'boolean':
                    return false;
                default:
                    return value;
            }
        }

        if (typeof value !== 'undefined') {
            switch (typeof typeToCase) {
                case 'string':
                    return value.toString();
                default:
                    return value as T;
            }
        }

        return getDefault();
    }
}
