const path = require('path')
const express = require('express')

const port = process.env.PORT || 5000;
const app = express()

app.use(express.static(path.join(__dirname, './public')))

app.get('/status', (_, res) => {
  res.send('ok')
})

app.listen(port, () => console.log(`Server listening on port ${port}.`))
