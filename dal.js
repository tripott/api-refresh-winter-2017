const PouchDB = require('pouchdb-http')
PouchDB.plugin(require('pouchdb-mapreduce'))
const couch_bare_uri = 'http://localhost:5984/'
const couch_dbname = 'foo'
const {map} = require('ramda')

const db = new PouchDB(couch_bare_uri + couch_dbname)

function getItem(itemID, cb) {
  db.get(itemID, function (err, doc) {
    if (err) return cb(err)
    cb(null, doc)
  })
}

function getItemsByPartNumber(cb) {
  db.query('itemByPartNumber', {include_docs: true}, function(err, docs) {
    if (err) return cb(err)
    return cb(null, map(row => row.doc , docs.rows))
  })
}

function getItemsByDate (startkey, endkey, cb) {


  db.query('itemsByDate', {include_docs: true, startkey: startkey, endkey: endkey}, function(err, docs) {
    console.log("start and end", startkey, endkey)
    if (err) return cb(err)
    return cb(null, map(row => row.doc , docs.rows))
  })

}

const dal = {
  getItem: getItem,
  getItemsByPartNumber: getItemsByPartNumber,
  getItemsByDate: getItemsByDate
}

module.exports = dal
