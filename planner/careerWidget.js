var container = document.getElementById('widget')
var pathDisplay = $('#path-display')
var selectionDisplay = $('#selection')
var statDisplay = $('#stat-display')
var primaryStats = $('#primary-stats').children('td')
var secondaryStats = $('#secondary-stats').children('td')
var talents = $('#talents')
var skills = $('#skills')
var pathField = $('#path')
var pathFound = $('#path-found')
var noPathFound = $('#no-path-found')

var canvas_width = window.innerWidth * 1.66
var canvas_height = window.innerHeight * 1.66
nodes.forEach(function(node) {
    node['x'] = node['x'] * canvas_width
    node['y'] = node['y'] * canvas_height
})
var backupNodes = new vis.DataSet(nodes)

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
        color: {
            color: '#aaa',
            opacity: 0.33
        },
        dashes: true,
        chosen: {
            edge: function(values, id, selected, hovering) {
                values.width = 4;
                values.color = '#555555';
                values.dashes = false;
                values.opacity = 1.0;
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
var network = new vis.Network(container, dataset, options)

var careers = nodes.map(node => node.label)
var careerIndex = makeCareerIndex()

var graph = new GraphFactory().createDirectedGraph(careers, edges)
var searcher = new GraphSearcher(graph)

var statIndex = {
    primary: [
        'WS', 'BS', 'S', 'T', 'Ag', 'Int', 'WP', 'Fel'
    ],
    secondary: [
        'A', 'W', 'SB', 'TB', 'M', 'Mag', 'IP', 'FP'
    ]
}
defaultStats = {
    'WS': 0, 'BS': 0, 'S': 0, 'T': 0, 'Ag': 0, 'Int': 0, 'WP': 0, 'Fel': 0,
    'A': 0, 'W': 0, 'SB': 0, 'TB': 0, 'M':0, 'Mag':0, 'IP':0, 'FP':0, 
    'Talents': ['None'], 'Skills': ['None']
}
var selectedNodes = []

function makeCareerIndex() {
    var index = new Map()
    nodes.forEach(node => index.set(node.label, node.id))
    return index
}
function getStats(selection) {
    selection = selection.length > 0 ? selection : [selectedNodes[0]]
    var stats = [
        'WS', 'BS', 'S', 'T', 'Ag', 'Int', 'WP', 'Fel',
        'A', 'W', 'SB', 'TB', 'M', 'Mag', 'IP', 'FP'
    ]
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
function updateSelectionDisplay(selection) {
    var careerNames = selection.length > 0 ? selection.map(x => careers[x]) : 'None'
    selectionDisplay.text(careerNames)
}
function updatePathDisplay(path) {
    var pathNames = path.map(x => careers[x])
    selectionDisplay.text(pathNames)
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
    return searcher.getPath(start, target, directed = false).reverse()
}
function getSelectedNodes(oldSelection, newSelection, changeEvent) {
    if (newSelection.length < 2)
        return newSelection
    
    var result = oldSelection.slice()
    
    if (changeEvent === 'select') {
        newSelection.forEach(node => {
            if (!result.includes(node)) 
                result.push(node)
        })
        return result
    }
    if (changeEvent === 'deselect') {
        result.forEach(node => {
            if (!newSelection.includes(node))
                result.splice(result.indexOf(node), 1)
        })
        return result        
    }
}
function updateView(selection) {
    if (selection.length === 0) {
        var stats = defaultStats
        updateSelectionDisplay(selection)
        updateStatDisplays(stats)
        pathFound.hide()
        noPathFound.hide()
    }
    else if (selection.length === 1) {
        var stats = getStats(selection)
        updatePathDisplay(selection)
        updateStatDisplays(stats)
    }
    else if (selection.length > 1) {
        var path = findCareerPath(selection[0], selection[selection.length - 1])
        updatePathDisplay(path)
        
        if (path.length > 0)
            selection = path
        else
            selection.pop()

        var stats = getStats(selection)
        var pathEdges = getPathEdges(selection)
        network.selectNodes(selection, false)
        network.selectEdges(pathEdges)
        network.setSelection({nodes: selection, edges: pathEdges})
        network.fit({nodes: path, animation: {duration: 200, easingFunction: 'easeInOutQuad'}})
        
        updateSelectionDisplay(selection)
        updateStatDisplays(stats)
    }
}

function init() {
    pathFound.hide()
    noPathFound.hide()
    network.on('selectNode', function(e) {
        selectedNodes = getSelectedNodes(selectedNodes, e.nodes, 'select')
        updateView(selectedNodes)
    })
    network.on('deselectNode', function(e) {
        selectedNodes = getSelectedNodes(selectedNodes, e.nodes, 'deselect')
        updateView(selectedNodes)
    })
}

$(function(){
    init()
})