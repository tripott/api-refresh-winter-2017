/*jshint esversion: 6 */
const PouchDB = require('pouchdb-http');
PouchDB.plugin(require('pouchdb-mapreduce'));
const couch_bare_uri = 'http://localhost:5984/'
const couch_dbname = 'foo'

const db = new PouchDB(couch_bare_uri + couch_dbname)

let items = [
  {
  "_id": "item_footastic_widget_34567",

  "type": "item",
  "name": "footastic widget",
  "partNumber": "34567",
  "components": [
    "screw bolt 5",
    "bolts",
    "hyperdrive"
  ],
  "cost": "10000"
},
{
  "_id": "item_phantom_widget_11112",

  "type": "item",
  "name": "phantom widget",
  "partNumber": "11112",
  "components": [
    "flux capacitor"
  ],
  "cost": "15000"
},
{
  "_id": "item_super_widget_11111",
  
  "type": "item",
  "name": "super widget",
  "partNumber": "11111",
  "components": [
    "hyperdrive",
    "flux capacitor"
  ],
  "cost": "20000"
}
]

// put the documents into the database with a single call to bulkDocs();
db.bulkDocs(items, function(err, response) {
    if (err) return console.log(err)
    if (response) {
        // call bulkGet() with an array of id and rev pairs representing the revisions to fetch.
        //  The response from bulkDocs is an array of objects containing id and rev properties.
        db.bulkGet({
            include_docs: true,
            docs: response
        }, function(err, res) {
            if (err) {
                return console.log(err);
            }
            if (res) {
                return console.log("bulkGet response: ", JSON.stringify(res, null, 2));
            }
        });
    }
});

/////////////////////
//   DESIGN DOCS (QUERIES/VIEWS/INDEXES)
/////////////////////
// To create views in CouchDB,  you create a function that takes a document
// and outputs (emit) key value pairs.
// Do NOT emit() the full document in your map/reduce functions.
// Instead, use {include_docs: true} when you query the view
const design_partsByPartNumber = {
    _id: "_design/partsByPartNumber",
    language: "javascript",
    views: {
        partsByPartNumber: {
            map: function(doc) {
                if (doc.type === "item") {
                   emit(doc.partNumber, 0);
                }
            }.toString()
        }
    }
}
addView(design_partsByPartNumber);


/////////////////////
/// helper functions
/////////////////////
function addView(view) {
    // put the design document and view into the database
    db.put(view, function(err, response) {
        if (err) return console.log(err)
        if (response) {
            console.log("response: ", JSON.stringify(response, null, 2));
        }
    });
}
