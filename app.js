const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const HTTPError = require('node-http-error')
const cors = require('cors')
const port = process.env.PORT || 8080
const {getItem, getItemsByPartNumber, getItemsByDate} = require('./dal')
const {split, map} = require('ramda')

app.use(cors({credentials: true}))
app.use(bodyParser.json())

 app.get('/item/:id', function(req, res, next) {
   getItem(req.params.id, function(err, doc) {
     if (err) return next(new HTTPError(err.status, err.message, err))
     res.status(200).send(doc)
   })
 })

app.get('/items', function (req, res, next) {
  getItemsByPartNumber(function(err, items) {
    if (err) return next(new HTTPError(err.status, err.message, err))


    res.status(200).send(items)
  })
})

app.get('/itemsbydate', function (req, res, next) {

  const startkey = map(nbr => Number(nbr), split(',', req.query.startkey))
  const endkey = map(nbr => Number(nbr), split(',', req.query.endkey))

  //console.log("start and end", startkey, endkey)

  getItemsByDate(startkey, endkey, function(err, items) {
    if (err) return next(new HTTPError(err.status, err.message, err))


    res.status(200).send(items)
  })
})


app.get('/', function (req, res) {
  res.send('Welcome to the API. You silly man.')
})

app.use(function(err, req, res, next) {
  console.log(req.method, " ", req.path, "error: ", err)
  res.status(err.status || 500)
  res.send(err)
})

app.listen(port, function () {
  console.log("API is up and running on port ", port)
})
