module.exports = {
  apps: [{
    name: 'letsProxy',
    script: 'index.js',

    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    instances: 1,
    autorestart: true,
    watch: false,
    combine_logs: true,
    max_memory_restart: '256M',
    env: {
      PORT: 3000
    }
  }]
}
