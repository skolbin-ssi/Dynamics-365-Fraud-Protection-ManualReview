## Components decoration

#### @autoBind and @observer
In case you use both decorators on the same class you may find a warning in console. This may happen
because @autoBind changes the render function (e.g. `this.render = this.render.bind(this);`), and it can not be ovserved by 
mobX anymore.
> `The render function for an observer component (<Component Display Name>) was modified after MobX attached. This is not supported, since the new function can't be triggered by MobX.`

🚫 Will trigger a warning in case component is unmounted and mounted again.
```typescript jsx
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import autoBind  from 'autobind-decorator';

@observer
@autoBind
export class Button extends Component<{data: any}, never> {
    onClick() { console.log(this.props.data); }
    render() { return (<button onClick={this.onClick} />); }
}
```

✅ Will not trigger a warning (recommended approach)
```typescript jsx
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import autoBind  from 'autobind-decorator';

@observer
export class Button extends Component<{data: any}, never> {
    @autoBind
    onClick() { console.log(this.props.data); }
    
    render() { return (<button onClick={this.onClick} />); }
}
```
