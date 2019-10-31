module.exports = {
    apps: [
        {
            name: "$NAME$-api",
            script: "node",
            args: "server.js",
            instances: "max",
            autorestart: true,
            watch: false,
            max_memory_restart: "1G"
        }
    ]
};
