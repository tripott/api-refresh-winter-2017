# api-refresh-winter-2017

## TODOS

- Ensure CouchDB is up and running Ex:http://localhost:5984/_utils/#database/pharma-student/_all_docs 
- If not, use `docker ps` to list containers.  
- `docker start <container id>` to start couchDB
- Create **Foo** database and add 3 new documents, like this:
  
  ```
  {
  "_id": "part_footastic_widget_34567",
  "type": "item",
  "name": "footastic widget",
  "partNumber": "34567" 
  "compontents": [
    "screws",
    "bolts",
    "hyperdrive"
  ],
  "cost": "10000"
  }
  ```

- Create a **partsByPartNumber** view that sorts the parts by part number and allows the ability to search for a specific key, keys, or range of keys using pouchdb api's `db.query()`
- Create and edit **dal.js**. npm install and require pouchdb-http and the pouchdb-mapreduce plug in.
- connect to couch via the pouchdb-http api: 

  ```
  const PouchDB = require('pouchdb-http')
  PouchDB.plugin(require('pouchdb-mapreduce'))
  const couch_base_uri = "http://127.0.0.1:5984/"
  const couch_dbname = "Foo" 
  const db = new PouchDB(couch_base_uri + couch_dbname)
  ```
  
- Create the DAL that we will leverage within our API code, in the future. Within the DAL, create function to get a single item.  The function will take the pk value for the itemId and a callback function.  We'll call the callback function after we attempt to db.get() a specific document from the database.   The callback function is used to asyncronously notify the caller that we are done.  
  
  ```
  function getItem(itemId, cb) {
    db.get(itemId, function(err, doc) {
        if (err) return cb(err)
        cb(null, doc)
    })
  }
  ```

- Start creating the ExpressJS API.  Create and edit **app.js**. npm install dependency and require express, ramda, body-parser, node-http-error, cors.  The body-parser is expressjs middleware that parses the body content of an HTTP POST or PUT.  cors (cross origin resource sharing) middleware enables secure cross-domain data transfers.

  ```
  const express = require('express')
  const app = express()
  const { split } = require('ramda')
  const bodyParser = require('body-parser')
  const HTTPError = require('node-http-error')
  const port = process.env.PORT || 8080
  const cors = require('cors')

  app.use(cors({
      credentials: true
  }))
  app.use(bodyParser.json())
  ```
  
- At the bottom of our app.js file, create our home URL or "route", error handler middleware, and begin listening to requests from client applications (React, POSTman, etc.)

  ```  
  app.get('/', function(req, res) {
      res.send('Welcome to the API!')
  })

  app.use(function(err, req, res, next) {
      console.log(req.method, " ", req.path, "error:  ", err)
      res.status(err.status || 500)
      res.send(err)
  })

  app.listen(port, function() {
      console.log("API is up and running on port ", port)
  })
  ```
  
- Near the top of our app.js file, create a URL route to handle a request to GET a single item:

  ```
  app.get('/item/:id', function(req, res, next) {
    getItem(req.params.id, function(err, dalResponse) {
        if (err) return next(new HTTPError(err.status, err.message, err))
        res.status(200).send(dalResponse)
    })
  })
  ```

- Test our home and item/:id urls using POSTman
- Create a route to retrieve all the items.  Within the dal, use db.allDocs(). prefix search  You can do prefix search in allDocs() – i.e. “give me all the documents whose _ids start with 'foo'” – by using the special high Unicode character '\uffff':
  
  ```
  db.allDocs({
    include_docs: true,
    attachments: true,
    startkey: 'foo',
    endkey: 'foo\uffff' 
    }, function(err, response) {
    if (err) { return console.log(err); }
      // handle result
    });
  ```
- Use db.query() to call a view instead of db.allDocs(). 
