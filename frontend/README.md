## Microsoft Dynamics 365 Fraud Protection - Manual review (Front End)

## Development

#### Environment
Tools that have to be installed in your local environment.

- `NodeJS` 12.16.1
- `npm` 6.13.4
- `yarn` 1.22.0

#### Quick Start
For quick project setup in development mode, you need:
   1. Specify several environment variables for instance in .env file (See [sample.env](./sample.env) as example)
      - API_BASE_URL - base Backend URL you want the frontend to communicate with, used in [setupProxy.js](./src/setupProxy.js)
      - LOG_LEVEL - can be error | warn | info | debug | trace, debug is used by default in [development-configuration.ts](./src/utility-services/configuration/development-configuration.ts)
      - CLIENT_ID, TENANT, MAP_CLIENT_ID, TOKEN_PERSIST_KEY, NONCE_PERSIST_KEY - are used in [development-configuration.ts](./src/utility-services/configuration/development-configuration.ts)
      
   2. Execute the following commands.
        ```sh
        > cd ./msd365fp-manual-review/frontend
        > yarn
        > yarn start
        ```

#### Deployment
In order to perform deployment refer to [deployment guide](../arm/README.md) 

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Contribution
Find detailed information in the [Contribution guide](./CONTRIBUTION.md).
