const path = require('path')
const express = require('express')

const port = 5000
const app = express()

// app.use(express.static(path.join(__dirname, '../sandbox')))

app.get('/', (_, res) => {
  res.send('hello world!')
})

app.listen(port, () => console.log(`Server listening on port ${port}.`))
