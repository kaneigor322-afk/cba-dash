module.exports = {
    apps: [
        {
            name: 'cba-dash',
            script: 'server.js',
            env_production: {
                NODE_ENV: 'production',
                PORT: 3000,
            },
        },
    ],
};
