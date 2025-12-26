module.exports = {
    apps: [
        {
            name: 'mypanel',
            port: '3031',
            exec_mode: 'cluster',
            instances: '1',
            script: './.output/server/index.mjs',

        }
    ]
}
