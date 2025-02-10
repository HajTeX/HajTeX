const http = require('http')
http.globalAgent.maxSockets = 300

module.exports = {
  internal: {
    gitsync: {
      host: process.env.LISTEN_ADDRESS || '127.0.0.1',
      port: 3355,
      gitsync_image: process.env.GITSYNC_IMAGE || 'ghcr.io/hajtex/hajtex/gitsync-runner:latest'
    },
  },

  apis: {
    web: {
      url: `http://${process.env.WEB_HOST || '127.0.0.1'}:${
        process.env.WEB_PORT || 3000
      }`,
      user: process.env.WEB_API_USER || 'overleaf',
      pass: process.env.WEB_API_PASSWORD || 'password',
    },
  }
}
