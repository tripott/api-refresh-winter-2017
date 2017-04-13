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
  "cost": "15000",
  "energyStarRating": 99,
  "dateAdded": "2016-04-05T17:18Z",
  "mfg_id": "mfg_super_inc"
},
{
  "_id": "item_phantom_widget_11112",

  "type": "item",
  "name": "phantom widget",
  "partNumber": "11112",
  "components": [
    "flux capacitor"
  ],
  "cost": "15000",
  "energyStarRating": 99,
  "dateAdded": "2016-04-05T08:10Z",
  "mfg_id": "mfg_super_inc"
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
  "cost": "20000",
  "energyStarRating": 98,
  "dateAdded": "2016-04-01T15:34Z",
  "mfg_id": "mfg_super_inc"
},
{
  "_id": "item_crazy_widget_11113",

  "type": "item",
  "name": "crazy widget",
  "partNumber": "11113",
  "components": [
    "hyperdrive",
    "crazy sauce"
  ],
  "cost": "3000",
  "energyStarRating": 78,
  "dateAdded": "2016-04-12T11:34Z",
  "mfg_id": "mfg_crazy_inc"
},
{
  "_id": "mfg_crazy_inc",
  "type": "mfg",
  "name": "crazy inc",
  "hq_state": "SC"
},
{
  "_id": "mfg_super_inc",
  "type": "mfg",
  "name": "super inc",
  "hq_state": "NY"
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
const design_itemByPartNumber = {
    _id: "_design/itemByPartNumber",
    language: "javascript",
    views: {
        itemByPartNumber: {
            map: function(doc) {
                if (doc.type === "item") {
                   emit(doc.partNumber, 0);
                }
            }.toString()
        }
    }
}
addView(design_itemByPartNumber);

///////////////////////////////////////////////////////////////
//        items sorted by cost then name
///////////////////////////////////////////////////////////////
// use complex keys to sort query results by cost then name
// note the names of the design document and view are the SAME
// recommend that you create one view per design doc,
// and use the same name for both, in order to make things simpler.
const design_itemCostName = {
    _id: "_design/itemCostName",
    language: "javascript",
    views: {
        itemCostName: {
            map: function(doc) {
              if (doc.type === "item") {
                emit([doc.cost, doc.name], 0);
              }
            }.toString()
        }
    }
}
addView(design_itemCostName);


const itemsByDate = {
    _id: "_design/itemsByDate",
    language: "javascript",
    views: {
        itemsByDate: {
            map: function(doc) {
                if (doc.type === "item") {
                    const dateAdded = new Date(doc.dateAdded)
                    emit([dateAdded.getUTCFullYear(),
                        dateAdded.getUTCMonth() + 1,
                        dateAdded.getUTCDate(),
                        dateAdded.getUTCHours(),
                        dateAdded.getUTCMinutes()
                      ],null);
                }
            }.toString()
        }
    }
}
addView(itemsByDate);


///////////////////////////////////////////////
//       Return mfg and items.
///////////////////////////////////////////////
// View functions specify a key and a value to be returned for each row.
// CouchDB collates (sorts) the view rows by this key.
// The key is composed of a mfg _id and a sorting token.
// Because the first key value is the mfg id,
// all mfg and items docs will be sorted by mfg.
// Because the second key value (aka sorting token) for mfg (0) is lower than the token for items (1),
// the mfg document will come before the associated items.
// The values 0 and 1 for the sorting token are arbitrary.
const designDocItemsAndMfg = {
    _id: "_design/itemsAndMfg",
    language: "javascript",
    views: {
        itemsAndMfg: {
            map: function(doc) {
                if (doc.type == "mfg") {
                    emit([doc._id, 0], null);
                } else if (doc.type == "item") {
                    emit([doc.mfg_id, 1], null);
                }
            }.toString()
        }
    }
}
addView(designDocItemsAndMfg);


/////////////////////
//   DESIGN DOCS (QUERIES/VIEWS/INDEXES)
/////////////////////
// To create views in CouchDB,  you create a function that takes a document
// and outputs (emit) key value pairs.
// Do NOT emit() the full document in your map/reduce functions.
// Instead, use {include_docs: true} when you query the view
const design_components = {
    _id: "_design/components",
    language: "javascript",
    views: {
        components: {
            map: function(doc) {
              if(doc.type === "item" && doc.components) {
                  doc.components.forEach(function(component) {
                    emit(component, 1);
                  });
                }
            }.toString()
        }
    }
}
addView(design_components);






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
