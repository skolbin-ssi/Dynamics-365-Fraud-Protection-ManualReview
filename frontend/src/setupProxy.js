const { createProxyMiddleware } = require('http-proxy-middleware');

/**
 * Setup of proxy for Webpack Dev Server to workaround CORS issues in development mode
 * @param app
 */
module.exports = function proxyConfiguration(app) {
    app.use(
        '/api',
        createProxyMiddleware({
            // NOTE: in order to access local BackEnd installation replace target value
            // target: 'http://localhost:8080/api',
            target: 'https://dfp-manrev-dev.azurefd.net/api',
            secure: false,
            changeOrigin: true,
            // logLevel: 'debug',
            pathRewrite: {
                '^/api': ''
            }
        })
    );
};
