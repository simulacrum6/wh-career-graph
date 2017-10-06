var canvas_width = window.innerWidth * 1.66
var canvas_height = window.innerHeight * 1.66
nodes.forEach(function(node) {
    node['x'] = node['x'] * canvas_width
    node['y'] = node['y'] * canvas_height
})
// used to restore original state after modification
var backup_nodes = new vis.DataSet(nodes)
var dataset = {
    nodes: new vis.DataSet(nodes),
    edges: new vis.DataSet(edges)
}
var options = {
    height: '100%',
    width: '100%',
    physics: {
        enabled: false
    },
    nodes: {
        physics: false,
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
            to: true
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
        selectConnectedEdges: false,
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
var pathDisplay = $('#path-display')
var statDisplay = $('#stat-display')
var primaryStats = $('#primary-stats').children('td')
var secondaryStats = $('#secondary-stats').children('td')
var pathField = $('#path')
var pathFound = $('#path-found')
var noPathFound = $('#no-path-found')
var talents = $('#talents')
var skills = $('#skills')
var currentSelection = $('#selection')
var statIndex = {
    primary: [
        'WS', 
        'BS', 
        'S', 
        'T', 
        'Ag', 
        'Int', 
        'WP', 
        'Fel'
    ],
    secondary: [
        'A', 
        'W',
        'SB',
        'TB',
        'M', 
        'Mag',
        'IP',
        'FP'
    ]
}
var selectedNodes = []

var network = new vis.Network(container, dataset, options)
    network.on('stabilized', function() {
        network.setOptions({
            edges: {physics: true}
        })
    })
    network.on('selectNode', function(e) {
        e.nodes.forEach(node => {
            if (!selectedNodes.includes(node)) 
                selectedNodes.push(node)
        })
        if (selectedNodes.length === 1) {
            var stats = getStats(selectedNodes)
            updatePathDisplay(selectedNodes)
            updateStatDisplays(stats)
        }
        else if (selectedNodes.length > 1) {
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
        if (selectedNodes.length === 1) {
            var stats = getStats(selectedNodes)
            updatePathDisplay(selectedNodes)
            updateStatDisplays(stats)
        }
        else if (selectedNodes.length > 1) {
            findCareerPath(selectedNodes[0], selectedNodes[selectedNodes.length - 1])
        }
    })

function makeCareerIndex() {
    var index = new Map()
    nodes.forEach(node => index.set(node.label, node.id))
    return index
}
var careers = nodes.map(node => node.label)
var careerIndex = makeCareerIndex()


var graph = new GraphFactory().createDirectedGraph(careers, edges)
var searcher = new GraphSearcher(graph)

function getStats(selection) {
    selection = selection.length > 0 ? selection : [selectedNodes[0]]
    var stats = [
        'WS', 'BS', 'S', 
        'T', 'Ag', 'Int', 
        'WP', 'Fel', 'A', 
        'W', 'Mag'
    ]
    /*var stats = [
        'weapon skill', 'ballistic skill', 'strength', 
        'toughness', 'agility', 'intelligence', 
        'will power', 'fellowship', 'attacks', 
        'wounds', 'magic'
    ]*/
    var props = ['Skills', 'Talents']
    var combinedStats = {}
    stats.forEach(stat => {
        var values = selection.map(x => dataset.nodes.get(x)[stat])
        if (values.length > 0)
            combinedStats[stat] = values.reduce((a,b) => Math.max(a,b))
        else 
            combinedStats[stat] = 0
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

function updatePrimaryStats(stats) {
    for (var i in statIndex.primary) {
        var stat = statIndex.primary[i]
        primaryStats.eq(i).text(stats[stat])
    }    
}
function updateSecondaryStats(stats) {
    for (var i in statIndex.secondary) {
        var stat = statIndex.secondary[i]
        secondaryStats.eq(i).text(stats[stat])
    }
}
function updateTalents(stats) {
    talents.text(stats['Talents'].join(', '))
}
function updateSkills(stats) {
    skills.text(stats['Skills'].join(', '))
}
function updateStatDisplays(stats) {
    updatePrimaryStats(stats)
    updateSecondaryStats(stats)
    updateTalents(stats)
    updateSkills(stats)
}
function updateSelection(selection) {
    currentSelection.text(selectedNodes)
}
function updatePathDisplay(path) {
    var pathNames = path.map(x => careers[x])
    currentSelection.text(pathNames)
    if (path.length === 1) {
        noPathFound.hide()
        pathFound.hide()
    } else if (path.length > 1) {
        pathField.text(pathNames)
        pathFound.show()
        noPathFound.hide()
    } else {
        noPathFound.show()
        pathFound.hide()
    }    
}
function getPathEdges(path) {
    var edges = []
    for (var i = 1; i < path.length; i++)
        edges.push(path[i-1].toString() + '--' + path[i].toString())
    return edges
}



function findCareerPath(start, target) {
    var path = searcher.getPath(start, target, directed = false).reverse()
    network.fit({nodes: path, animation: true})
    updatePathDisplay(path)
    if (path.length > 0) {
        network.selectNodes(path, false)
        network.selectEdges(getPathEdges(path))
        selectedNodes = path
        var stats = getStats(path)
        updateStatDisplays(stats)
    } else {
        selectedNodes.pop()
        currentSelection.text(selectedNodes.map(nodeId => careers[nodeId]))
        var stats = getStats(selectedNodes)
        updateStatDisplays(stats)
        network.unselectAll()
        network.selectNodes(selectedNodes, true)
    }
}

function init() {
    pathFound.hide()
    noPathFound.hide()
}

$(function(){
    init()
})