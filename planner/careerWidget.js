var nodes = [{"career":"Prodigy","type":"Basic","role":"Academics","exits":"Student","skills":["a OR b"],"talents":["c","d","e"],"weapon skill":0,"ballistic skill":0,"strength":0,"toughness":0,"agility":5,"intelligence":15,"will power":10,"fellowship":15,"attacks":0,"wounds":0,"magic":0,"id":0,"label":"Prodigy","group":"Basic","color":"#2E86AB"},{"career":"Dilletante","type":"Basic","role":"Commoners","exits":"Student","skills":["a (any two)","c","d"],"talents":["x","y"],"weapon skill":5,"ballistic skill":5,"strength":0,"toughness":0,"agility":5,"intelligence":5,"will power":5,"fellowship":10,"attacks":0,"wounds":1,"magic":0,"id":1,"label":"Dilletante","group":"Basic","color":"#EDDFCE"},{"career":"Student","type":"Basic","role":"Academics","exits":"Scholar","skills":["read","blather"],"talents":["quirky"],"weapon skill":0,"ballistic skill":0,"strength":0,"toughness":0,"agility":10,"intelligence":10,"will power":5,"fellowship":10,"attacks":0,"wounds":2,"magic":0,"id":2,"label":"Student","group":"Basic","color":"#2E86AB"},{"career":"Apprentice Wizard","type":"Basic","role":"Academics","exits":"Scholar","skills":["c","d"],"talents":["e","f"],"weapon skill":0,"ballistic skill":0,"strength":0,"toughness":0,"agility":5,"intelligence":10,"will power":15,"fellowship":5,"attacks":0,"wounds":2,"magic":1,"id":3,"label":"Apprentice Wizard","group":"Basic","color":"#2E86AB"},{"career":"Wizard","type":"Advanced","role":"Academics","exits":"Wizard Lord, Scholar, Explorer","skills":["a","c"],"talents":["b"],"weapon skill":10,"ballistic skill":10,"strength":0,"toughness":10,"agility":15,"intelligence":30,"will power":35,"fellowship":15,"attacks":0,"wounds":4,"magic":3,"id":4,"label":"Wizard","group":"Advanced","color":"#2E86AB"},{"career":"Wizard Lord","type":"Advanced","role":"Academics","exits":"Explorer","skills":[" "],"talents":["f","g"],"weapon skill":15,"ballistic skill":15,"strength":5,"toughness":15,"agility":20,"intelligence":35,"will power":40,"fellowship":20,"attacks":0,"wounds":5,"magic":4,"id":5,"label":"Wizard Lord","group":"Advanced","color":"#2E86AB"},{"career":"Scholar","type":"Advanced","role":"Academics","exits":"Wizard, Explorer","skills":["d","e"],"talents":["f","e"],"weapon skill":0,"ballistic skill":0,"strength":0,"toughness":0,"agility":5,"intelligence":10,"will power":15,"fellowship":15,"attacks":0,"wounds":0,"magic":0,"id":6,"label":"Scholar","group":"Advanced","color":"#2E86AB"},{"career":"Explorer","type":"Advanced","role":"Rangers","exits":" ","skills":[" "],"talents":["g","h"],"weapon skill":20,"ballistic skill":20,"strength":10,"toughness":15,"agility":15,"intelligence":25,"will power":20,"fellowship":15,"attacks":1,"wounds":6,"magic":0,"id":7,"label":"Explorer","group":"Advanced","color":"#C5D86D"},{"career":"Herald","type":"Advanced","role":"Commoners","exits":"Explorer","skills":[" "],"talents":[" "],"weapon skill":10,"ballistic skill":10,"strength":5,"toughness":5,"agility":15,"intelligence":15,"will power":10,"fellowship":20,"attacks":0,"wounds":4,"magic":0,"id":8,"label":"Herald","group":"Advanced","color":"#EDDFCE"},{"career":"Messenger","type":"Basic","role":"Rangers","exits":"Herald, Explorer","skills":["a"],"talents":["a"],"weapon skill":5,"ballistic skill":5,"strength":0,"toughness":5,"agility":10,"intelligence":5,"will power":5,"fellowship":0,"attacks":0,"wounds":2,"magic":0,"id":9,"label":"Messenger","group":"Basic","color":"#C5D86D"},{"career":"Militiaman","type":"Basic","role":"Warriors","exits":"Messenger","skills":["a"],"talents":["a"],"weapon skill":10,"ballistic skill":5,"strength":5,"toughness":5,"agility":10,"intelligence":0,"will power":0,"fellowship":0,"attacks":0,"wounds":2,"magic":0,"id":10,"label":"Militiaman","group":"Basic","color":"#FE7F2D"}]

var edges = [{"from":1,"to":2,"weight":1,"id":"1--2"},{"from":0,"to":2,"weight":1,"id":"0--2"},{"from":5,"to":7,"weight":1,"id":"5--7"},{"from":4,"to":7,"weight":1,"id":"4--7"},{"from":8,"to":7,"weight":1,"id":"8--7"},{"from":10,"to":9,"weight":1,"id":"10--9"},{"from":6,"to":7,"weight":1,"id":"6--7"},{"from":4,"to":5,"weight":1,"id":"4--5"},{"from":9,"to":7,"weight":1,"id":"9--7"},{"from":3,"to":6,"weight":1,"id":"3--6"},{"from":9,"to":8,"weight":1,"id":"9--8"},{"from":6,"to":4,"weight":1,"id":"6--4"},{"from":2,"to":6,"weight":1,"id":"2--6"},{"from":4,"to":6,"weight":1,"id":"4--6"}]

// used to restore original state after modification
var backup_nodes = new vis.DataSet(nodes)
var dataset = {
    nodes: new vis.DataSet(nodes),
    edges: new vis.DataSet(edges)
}
var options = {
    nodes: {
        shadow: false,
        chosen: {
            node: function(values, id, selected, hovering) {
                values.size = values.size * 1.66;
                values.borderColor = '#1e2426';
                values.borderWidth = 4;
                values.shadow = true;
            }} 
    },
    edges: {
        arrows: {
            to: true,
            middle: false
        },
        arrowStrikethrough: false,
        color: '#aaa',
        dashes: true,
        chosen: {
            edge: function(values, id, selected, hovering) {
                values.width = 3;
                values.color = '#555555';
                values.dashes = false;
            }
        }
    },
    interaction: {
        selectConnectedEdges: true,
        multiselect: true,
        hover: true
    },
    groups: {
        Basic: {
            shape: 'dot',
            color: {
                border: 'black'
            }
        },
        Advanced: {
            shape: 'diamond',
            borderWidth: 4,
            color: {
                border: 'gold'
            },
            size: 35
        }
    }
}
var container = document.getElementById('widget')
var pathDisplay = document.getElementById('path-display')
var statDisplay = document.getElementById('stat-display')
var selectedNodes = []

var network = new vis.Network(container, dataset, options)
    network.on('stabilized', function() {
        network.setOptions({
            nodes: {physics: false}
        })
    })
    network.on('selectNode', function(e) {
        e.nodes.forEach(node => {
            if (!selectedNodes.includes(node)) 
                selectedNodes.push(node)
        })
        if (selectedNodes.length > 1) {
            findCareerPath(selectedNodes[0], selectedNodes[selectedNodes.length - 1])
        }
    })
    network.on('deselectNode', function(e) {
        if (e.nodes.length < 2) {
            selectedNodes = e.nodes
        } else {
            selectedNodes.forEach(node => {
                if (!e.nodes.includes(node)) {
                    selectedNodes.splice(selectedNodes.indexOf(node), 1)
                }
            })
        }
    })

var careers = nodes.map(node => node.label)
var careerIndex = function makeCareerIndex() {
    var index = {}
    nodes.forEach(node => index[node.label] = node.id)
    return index
}

var graph = new GraphFactory().createDirectedGraph(careers, edges)
var searcher = new GraphSearcher(graph)

function maxStats(selection) {
    var stats = [
        'weapon skill', 'ballistic skill', 'strength', 
        'toughness', 'agility', 'intelligence', 
        'will power', 'fellowship', 'attacks', 
        'wounds', 'magic'
    ]
    var props = ['skills', 'talents']
    var combinedStats = {}
    stats.forEach(stat => {
        var values = selection.map(x => dataset.nodes.get(x)[stat])
        combinedStats[stat] = values.reduce((a,b) => Math.max(a,b))
    })
    props.forEach(prop => {
        var values = selection.map(x => dataset.nodes.get(x)[prop])
        values = [].concat.apply([],values)
        var uniques = new Set(values)
        values = []
        uniques.forEach(x => values.push(x))         
        combinedStats[prop] = values
    })
    return combinedStats
}

function statDisplayString(stats) {
    var display = 'Your final stats will be: '
    for (stat in stats) {
        display += stat + ':' + stats[stat] + ' '
    }
    return display
}

function pathDisplayString(path) {
    var pathString = path.length > 0 ? 'The fastest path for your selection is: ' : 'There is no career path between the chosen career options. :(' 
    var pathCareers = path.map(id => careers[id])
    return pathString + pathCareers
}

function findCareerPath(start, target) {
    var path = searcher.getPath(start, target, directed = false).reverse()
    network.selectNodes(path, true)
    network.fit({nodes: path, animation: true})
    pathDisplay.innerText = pathDisplayString(path)
    if (path.length > 0) {
        statDisplay.innerText = statDisplayString(maxStats(path))
    } else {
        selectedNodes.pop()
        network.unselectAll()
        network.selectNodes(selectedNodes, true)
    }
}