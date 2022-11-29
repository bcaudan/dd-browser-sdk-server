function withBackend(app) {
  app.get('/error', function (req, res) {
      res.sendStatus(500)
  })

  app.get('/ok', (req, res) => {
    const timeoutDuration = req.query.duration ? Number(req.query.duration) : 0
    setTimeout(() => res.send('ok'), timeoutDuration)
  })
}

module.exports = { withBackend }
