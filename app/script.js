const neo4j = require('neo4j-driver')
const fs = require('fs')
let title = [];
let nodes = [];
let edges = [];
var sys;

document.addEventListener('DOMContentLoaded', async e => {
    const driver = neo4j.driver('neo4j+s://7d6f2aa6.databases.neo4j.io',
        neo4j.auth.basic("neo4j", "operanetwork"))
    const session = driver.session()
    try {
        const result = await session.run(
            'MATCH (n:title) RETURN n'
        )

        console.log(result.records[0].get(0))

        for (let el of result.records) {
            title.push(el.get(0).properties.title);
        }
        fs.writeFile('allOperaTitle.json', JSON.stringify(title), (err) => {
            if (err) throw err;
            console.log('Data written to file');
        });

    } finally {
        await session.close()
    }

    // on application exit:
    await driver.close()

    sys = arbor.ParticleSystem(1000, 400, 1);
    sys.parameters({ gravity: true });
    sys.renderer = Renderer("#viewport");
}, false);

$("#catQ").click(async function () {
    const driver = neo4j.driver('bolt://localhost:7687',
        neo4j.auth.basic("neo4j", "bigdata"))
    const session = driver.session()
    let first = $('#firstArticle').val();
    let second = $('#secondArticle').val()
    if (first === second) {
        return;
    }
    try {
        const result = await session.run(
            'MATCH (nodo1:Article {name: \'' + first + '\'}),\n' +
            '      (nodo2:Article {name: \'' + second + '\'})\n' +
            'RETURN nodo1, nodo2'
        )

        for (let n of edges) {
            sys.pruneEdge(n)
        }

        for (let n of nodes) {
            sys.pruneNode(n)
        }
        nodes.splice(0, nodes.length)

        edges.splice(0, edges.length)

        console.log(result);

        for (let el of result.records) {
            for (let i = 0; i < el.length; i++) {
                console.log(el);
                var n1, n2;
                name1 = el.get(i).properties.name;
                cat1 = ((el.get(i).properties.category)).slice(1, -2);
                catList = cat1.split(",");
                var n = sys.addNode(name1, { 'color': 'green', 'shape': 'dot', 'label': name1 });
                nodes.push(n);
                for (let cat of catList) {
                    let catS = cat.split(".");
                    var c = sys.addNode(catS[1], { 'color': 'blue', 'shape': 'square', 'label': catS[1] });
                    nodes.push(c);
                    e = sys.addEdge(n, c);
                    edges.push(e);
                    var c1 = c;
                    for (let i = 2; i < catS.length; i++) {
                        var c2 = sys.addNode(catS[i], { 'color': 'blue', 'shape': 'square', 'label': catS[i] });
                        nodes.push(c);
                        e = sys.addEdge(c1, c2);
                        edges.push(e);
                        nodes.push(c2);
                        var c1 = c2;
                    }
                }
            }
        }

        console.log(result)


    } finally {
        await session.close()
    }

    // on application exit:
    await driver.close()
});

$("#libC").click(async function () {
    const driver = neo4j.driver('neo4j+s://7d6f2aa6.databases.neo4j.io',
        neo4j.auth.basic("neo4j", "operanetwork"))
    const session = driver.session()
    try {
        const result = await session.run(
            'MATCH (a:composer) -[r:collaboration]-> (b:librettist)\n' +
            'RETURN a,b,r'
        )

        for (let n of edges) {
            sys.pruneEdge(n)
        }

        for (let n of nodes) {
            sys.pruneNode(n)
        }
        nodes.splice(0, nodes.length)

        edges.splice(0, edges.length)

        console.log(result.records)

        for (let el of result.records) {
            console.log(el);
            name1 = el.get(0).properties.composer;
            name2 = el.get(1).properties.librettist;
            console.log(sys)
            var n1 = sys.addNode(name1, { 'color': 'green', 'shape': 'dot', 'label': name1, mass: 1 });
            var n2 = sys.addNode(name2, { 'color': 'red', 'shape': 'dot', 'label': name2, mass: 0.5 });
            e = sys.addEdge(n1, n2, { directed: true, label: "Collaboration" }, { color: "black" });
            nodes.push(n1);
            nodes.push(n2);
            edges.push(e);
        }


    } finally {
        await session.close()
    }

    // on application exit:
    await driver.close()
});

$("#infop").click(async function () {
    const driver = neo4j.driver('neo4j+s://7d6f2aa6.databases.neo4j.io',
        neo4j.auth.basic("neo4j", "operanetwork"))
    const session = driver.session()
    let title = $('#title').val();
    try {
        const result = await session.run(
            'MATCH (node1 {title:"' + title + '"})-[r]-(node2) RETURN node1, node2, r'
        )

        for (let n of edges) {
            sys.pruneEdge(n)
        }

        for (let n of nodes) {
            sys.pruneNode(n)
        }
        nodes.splice(0, nodes.length)

        edges.splice(0, edges.length)

        console.log(result.records[0])
        console.log(result.records[1])

        name1 = result.records[0].get(0).properties.title;
        var n1 = sys.addNode(name1, { 'color': 'green', 'shape': 'dot', 'label': name1 });
        nodes.push(n1);

        for (let el of result.records) {
            if (el.get(1).properties.hasOwnProperty('librettist')) {
                name2 = el.get(1).properties.librettist;
                var n2 = sys.addNode(name2, { 'color': 'red', 'shape': 'dot', 'label': name2 });
                type = el.get(2).type;
                var t = sys.addNode(type, { 'color': 'blue', 'shape': 'square', 'label': type });
                e = sys.addEdge(n1, t, { directed: true });
                nodes.push(t);
                edges.push(e);
                e = sys.addEdge(t, n2);
                nodes.push(n2);
                edges.push(e);
            } else if (el.get(1).properties.hasOwnProperty('composer')) {

                name2 = el.get(1).properties.composer;
                var n2 = sys.addNode(name2, { 'color': 'red', 'shape': 'dot', 'label': name2 });
                type = el.get(2).type;
                var t = sys.addNode(type, { 'color': 'blue', 'shape': 'square', 'label': type });
                e = sys.addEdge(n1, t);
                nodes.push(t);
                edges.push(e);
                e = sys.addEdge(t, n2);
                nodes.push(n2);
                edges.push(e);
            } else if (el.get(1).properties.hasOwnProperty('placename')) {


                name2 = el.get(1).properties.placename;
                var n2 = sys.addNode(name2, { 'color': 'red', 'shape': 'dot', 'label': name2 });
                type = el.get(2).type;
                var t = sys.addNode(type, { 'color': 'blue', 'shape': 'square', 'label': type });
                e = sys.addEdge(n1, t);
                nodes.push(t);
                edges.push(e);
                e = sys.addEdge(t, n2);
                nodes.push(n2);
                edges.push(e);
            } else {

                name2 = el.get(1).properties.performance_year;
                var n2 = sys.addNode(name2, { 'color': 'red', 'shape': 'dot', 'label': name2 });
                type = el.get(2).type;
                var t = sys.addNode(type, { 'color': 'blue', 'shape': 'square', 'label': type });
                e = sys.addEdge(n1, t);
                nodes.push(t);
                edges.push(e);
                e = sys.addEdge(t, n2);
                nodes.push(n2);
                edges.push(e);
            }
        }

        } finally {
            await session.close()
        }

        // on application exit:
        await driver.close()
    });

$(".form-control").autocomplete({
    source: function (request, response) {
        var results = $.ui.autocomplete.filter(require('./allOperaTitle.json'), request.term);

        response(results.slice(0, 20));
    }
});
