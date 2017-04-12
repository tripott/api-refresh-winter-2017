const PouchDB = require('pouchdb-http')
PouchDB.plugin(require('pouchdb-mapreduce'))
const couch_bare_uri = 'http://localhost:5984/'
const couch_dbname = 'foo'

const db = new PouchDB(couch_bare_uri + couch_dbname)

function getItem(itemID, cb) {
  db.get(itemID, function (err, doc) {
    if (err) return cb(err)
    cb(null, doc)
  })
}

const dal = {
  getItem: getItem
}

module.exports = dal
