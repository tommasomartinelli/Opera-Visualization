const express = require('express')
      , http = require('http')
      , path = require('path')
      , bodyParser = require('body-parser')
      , app = express();
const neo4j = require('neo4j-driver');

// Crea una connessione al database neo4j
const driver = neo4j.driver(
  'neo4j+s://7d6f2aa6.databases.neo4j.io',
  neo4j.auth.basic('neo4j', 'operanetwork')
);

// Rendering index.html

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get('/graph', (req, res) => {
  const session = driver.session();

  // Esegue una query per recuperare il grafo dal database
  session
    .run(
      'MATCH (n)-[r]->(m) RETURN n, r, m'
    )
    .then(result => {
      // Crea un oggetto che rappresenta il grafo
      const graph = {
        nodes: [],
        edges: []
      };

      // Aggiunge i nodi e gli archi al grafo
      result.records.forEach(record => {
        graph.nodes.push({
          id: record.get('n').identity.low,
          label: record.get('n').properties.label
        });
        graph.edges.push({
          from: record.get('n').identity.low,
          to: record.get('m').identity.low,
          label: record.get('r').type
        });
      });

      // Invia il grafo al client
      res.send(graph);
    })
    .catch(error => {
      console.error(error);
      res.status(500).send(error);
    })
    .finally(() => {
      session.close();
    });
});

app.listen(3000, () => {
  console.log('Server avviato sulla porta 3000');
});