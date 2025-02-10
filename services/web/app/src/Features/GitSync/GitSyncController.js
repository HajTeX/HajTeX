let GitSyncController
const request = require('request')
const settings = require('@overleaf/settings')
const SessionManager = require('../Authentication/SessionManager')

module.exports = GitSyncController = {
  gitsync(req, res, next) {
    const userId = SessionManager.getLoggedInUserId(req.session)
    const { project_id: projectId } = req.params

    const url = settings.apis.gitsync.url + `/projects/${projectId}/gitsync`
    GitSyncController._makeRequest(
        {
          url,
          method: req.method,
          json: true,
          headers: {
            'X-User-Id': userId,
          },
        },
        function (err, body) {
          if (err) {
            return next(err)
          }
          res.json(body)
        }
    )
  },

  _makeRequest(options, callback) {
    return request(options, function (err, response, body) {
      if (err) {
        return callback(err)
      }
      if (response.statusCode >= 200 && response.statusCode < 300) {
        callback(null, body)
      } else {
        err = new Error(
          `history api responded with non-success code: ${response.statusCode}`
        )
        callback(err)
      }
    })
  },
}
