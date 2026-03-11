module.exports = {
    apps: [
        {
            name: 'state-machine',
            script: './dist/state-machine.js',
            max_memory_restart: '700M',
        },
        {
            name: 'catch-up',
            script: './dist/catch-up.js',
            max_memory_restart: '700M',
        },
    ],
};
