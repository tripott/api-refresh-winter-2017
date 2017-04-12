# api-refresh-winter-2017

## TODOS

0. Ensure CouchDB is up and running Ex:http://localhost:5984/_utils/#database/pharma-student/_all_docs 
0. If not, use `docker ps` to list containers.  
0. `docker start <container id>` to start couchDB
0. Create **Foo** database and add 3 new documents 
  
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
