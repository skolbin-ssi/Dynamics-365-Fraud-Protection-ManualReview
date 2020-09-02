## Why ejected create-react-app
In order to use Parameter decorators, for example:
```typescript
import { inject, injectable } from 'inversify';

@injectable()
export class AwesomeStore {
     constructor(@inject("SOME_SERVICE") private customerService: any) {}
}
```

At this point Babel does not have proper support of parameter decorators, however typescript does so we changed webpack 
configuration to process .ts and .tsx with `ts-loader` instead of `babel-loader` that was out of the box with create-react-app.

[Issue reference](https://github.com/babel/babel/issues/9838)
