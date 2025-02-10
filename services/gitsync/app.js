// Metrics must be initialized before importing anything else
import '@overleaf/metrics/initialize.js'

import logger from '@overleaf/logger'
import Settings from '@overleaf/settings'
import { app } from './app/js/server.js'

const { host, port } = Settings.internal.gitsync


app.listen(port, host, err => {
  if (err) {
    logger.fatal({ err }, `Cannot bind to ${host}:${port}. Exiting.`)
    process.exit(1)
  }
  logger.debug(`gitsync starting up, listening on ${host}:${port}`)
})
