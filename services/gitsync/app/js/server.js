import * as Metrics from '@overleaf/metrics'
import logger from '@overleaf/logger'
import express from 'express'
import bodyParser from 'body-parser'
import * as Errors from './Errors.js'
import * as HttpController from './HttpController.js'

logger.initialize('gitsync')
Metrics.event_loop?.monitor(logger)
Metrics.open_sockets.monitor()

export const app = express()
app.use(Metrics.http.monitor(logger))
Metrics.injectMetricsRoute(app)
app.param('project_id', (req, res, next, projectId) => {
  if (projectId != null && projectId.match(/^[0-9a-f]{24}$/)) {
    return next()
  } else {
    return next(new Error('invalid project id'))
  }
})

app.post(
  '/projects/:project_id/gitsync',
  bodyParser.json({ limit: '2mb' }),
  HttpController.gitSync
)

app.get('/status', (req, res) => res.send('gitsync is alive'))

app.use(function (error, req, res, next) {
  logger.error({ err: error }, 'request errored')
  if (error instanceof Errors.NotFoundError) {
    return res.sendStatus(404)
  } else {
    return res.status(500).send('Oops, something went wrong')
  }
})
