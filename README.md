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
- Edit **dal.js**. npm install and require pouchdb-http and the pouchdb-mapreduce plug in.
- connect to couch via the pouchdb-http api: 

  ```
  const PouchDB = require('pouchdb-http')
  PouchDB.plugin(require('pouchdb-mapreduce'))
  const couch_base_uri = "http://127.0.0.1:5984/"
  const couch_dbname = "Foo" 
  const db = new PouchDB(couch_base_uri + couch_dbname)
  ```
  
 - Within the DAL, create function to get a single item.  The function will take the pk value for the itemId and a callback function.  We'll call the callback function after we attempt to db.get() a specific document from the database.   The callback function is used to asyncronously notify the caller that we are done.  
  
  ```
  function getItem(itemId, cb) {
    db.get(itemId, function(err, doc) {
        if (err) return cb(err)
        cb(null, doc)
    })
  }
  ```
  
