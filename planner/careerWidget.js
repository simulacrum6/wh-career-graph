var nodes = [{"id":0,"label":"Prodigy","group":"Basic","color":"#2E86AB","career":"Prodigy","type":"Basic","role":"Academics"},{"id":1,"label":"Dilletante","group":"Basic","color":"#EDDFCE","career":"Dilletante","type":"Basic","role":"Commoners"},{"id":2,"label":"Student","group":"Basic","color":"#2E86AB","career":"Student","type":"Basic","role":"Academics"},{"id":3,"label":"Apprentice Wizard","group":"Basic","color":"#2E86AB","career":"Apprentice Wizard","type":"Basic","role":"Academics"},{"id":4,"label":"Wizard","group":"Advanced","color":"#2E86AB","career":"Wizard","type":"Advanced","role":"Academics"},{"id":5,"label":"Wizard Lord","group":"Advanced","color":"#2E86AB","career":"Wizard Lord","type":"Advanced","role":"Academics"},{"id":6,"label":"Scholar","group":"Advanced","color":"#2E86AB","career":"Scholar","type":"Advanced","role":"Academics"},{"id":7,"label":"Explorer","group":"Advanced","color":"#C5D86D","career":"Explorer","type":"Advanced","role":"Rangers"},{"id":8,"label":"Herald","group":"Advanced","color":"#EDDFCE","career":"Herald","type":"Advanced","role":"Commoners"},{"id":9,"label":"Messenger","group":"Basic","color":"#C5D86D","career":"Messenger","type":"Basic","role":"Rangers"},{"id":10,"label":"Militiaman","group":"Basic","color":"#FE7F2D","career":"Militiaman","type":"Basic","role":"Warriors"}]

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
var pathdisplay = document.getElementById('pathdisplay')
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
        findPath(selectedNodes[0], selectedNodes[selectedNodes.length - 1])
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
var careerIndex = {}
nodes.forEach(node => careerIndex[node.label] = node.id)
var graph = new GraphFactory().createDirectedGraph(careers, edges)
var searcher = new GraphSearcher(graph)

function findPath(start, target) {
    var pathStrings = {
        path: 'The fastest path for your selection is: ',
        nopath: 'There is no career path between the chosen career options. :('
    }
    var path = searcher.getPath(start, target, directed = false).reverse()
    network.selectNodes(path, true)
    network.fit({nodes: path, animation: true})
    if (path.length > 0) {
        var pathCareers = path.map(id => careers[id])
        pathdisplay.innerText = pathStrings.path + pathCareers
    } else {
        pathdisplay.innerText = pathStrings.nopath
        selectedNodes.pop()
        network.unselectAll()
        network.selectNodes(selectedNodes, true)
    }
}