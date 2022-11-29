function withBackend(app) {
  app.get('/error', function (req, res) {
      res.sendStatus(500)
  })
}

module.exports = { withBackend }
