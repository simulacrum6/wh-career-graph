var widgetContainer = document.getElementById('widget')
var pathDisplay = $('#path-display')
var selectionDisplay = $('#selection')
var statDisplay = $('#stat-display')
var primaryProfileDisplay = $('#primary-stats').children('td')
var secondaryProfileDisplay = $('#secondary-stats').children('td')
var talentsDisplay = $('#talents')
var skillsDisplay = $('#skills')
var pathField = $('#path')
var pathFoundMessage = $('#path-found')
var noPathFoundMessage = $('#no-path-found')
var careerSearchField = $('#single-career-search')
var careerPathSearchFields = $('#career-path-search').children('input')

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
var network = new vis.Network(widgetContainer, dataset, options)

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
    ],
    defaultStats: {
        'WS': 0, 'BS': 0, 'S': 0, 'T': 0, 'Ag': 0, 'Int': 0, 'WP': 0, 'Fel': 0,
        'A': 0, 'W': 0, 'SB': 0, 'TB': 0, 'M':0, 'Mag':0, 'IP':0, 'FP':0, 
        'Talents': ['None'], 'Skills': ['None']
    }
}
var selectedNodes = []

function makeCareerIndex() {
    var index = new Map()
    nodes.forEach(node => index.set(node.label, node.id))
    return index
}
function getSelection(oldSelection, newSelection, changeType) {
    if (newSelection.length < 2)
        return newSelection
    
    var selection = oldSelection.slice()
    
    if (changeType === 'select') {
        newSelection.forEach(node => {
            if (!selection.includes(node)) 
                selection.push(node)
        })
        return selection
    }
    if (changeType === 'deselect') {
        selection.forEach(node => {
            if (!newSelection.includes(node))
                selection.splice(selection.indexOf(node), 1)
        })
        return selection        
    }
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
function getCareerPath(startCareer, targetCareer) {
    return searcher.getPath(startCareer, targetCareer, directed = false).reverse()
}
function getPathEdges(path) {
    var edges = []
    for (var i = 1; i < path.length; i++)
        edges.push(path[i-1].toString() + '--' + path[i].toString())
    return edges
}
function setPrimaryProfileDisplay(stats) {
    for (var i in statIndex.primary) {
        var stat = statIndex.primary[i]
        primaryProfileDisplay.eq(i).text(stats[stat])
    }    
}
function setSecondaryProfileDisplay(stats) {
    for (var i in statIndex.secondary) {
        var stat = statIndex.secondary[i]
        secondaryProfileDisplay.eq(i).text(stats[stat])
    }
}
function setTalentsDisplay(stats) {
    talentsDisplay.text(stats['Talents'].join(', '))
}
function setSkillsDisplay(stats) {
    skillsDisplay.text(stats['Skills'].join(', '))
}
function setStatDisplays(stats) {
    setPrimaryProfileDisplay(stats)
    setSecondaryProfileDisplay(stats)
    setTalentsDisplay(stats)
    setSkillsDisplay(stats)
}
function setSelectionDisplay(selection) {
    var careerNames = selection.length > 0 ? selection.map(x => careers[x]).join(', ') : 'None'
    selectionDisplay.text(careerNames)
}
function setPathDisplay(path) {
    var pathNames = path.map(x => careers[x])
    if (path.length === 1) {
        noPathFoundMessage.hide()
        pathFoundMessage.hide()
    } else if (path.length > 1) {
        pathField.text(pathNames.join(', '))
        pathFoundMessage.show()
        noPathFoundMessage.hide()
    } else {
        noPathFoundMessage.show()
        pathFoundMessage.hide()
    }    
}
function updateView(selection) {
    if (selection.length === 0) {
        var stats = statIndex.defaultStats
        setSelectionDisplay(selection)
        setStatDisplays(stats)
        pathFoundMessage.hide()
        noPathFoundMessage.hide()
    }
    else if (selection.length === 1) {
        var stats = getStats(selection)
        setSelectionDisplay(selection)
        setPathDisplay(selection)
        setStatDisplays(stats)
    }
    else if (selection.length > 1) {
        var path = getCareerPath(selection[0], selection[selection.length - 1])
        setPathDisplay(path)
        
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
        
        setSelectionDisplay(selection)
        setStatDisplays(stats)
        selectedNodes = selection
    }
}
function uiCareerSearch() {
    var careerName = careerSearchField.val()
    var index = careerIndex.get(careerName, -1)
    if (index > -1) {
        network.fit({nodes: [index], animation: {duration: 225, easingFunction: 'easeInOutQuad'}})
    } else {
        noPathFoundMessage.show()
    }
}
function uiCareerPathSearch() {
    pathFoundMessage.hide()
    noPathFoundMessage.hide()
    var start = careerPathSearchFields.eq(0).val()
    var end = careerPathSearchFields.eq(1).val()
    start = careerIndex.get(start, false)
    end = careerIndex.get(end, false)
    if (start && end) {
        var path = searcher.getPath(start, end).reverse()
        setPathDisplay(path)
        network.fit({nodes: path, animation: {duration: 200, easingFunction: 'easeInOutQuad'}})
        if (path.length > 0) {
            selectedNodes = path
            var stats = getStats(selectedNodes)
            var pathEdges = getPathEdges(selectedNodes)
            network.selectNodes(selectedNodes, false)
            network.selectEdges(pathEdges)
            network.setSelection({nodes: selectedNodes, edges: pathEdges})
            setSelectionDisplay(selectedNodes)
            setStatDisplays(stats)
        }
    } else {
        noPathFoundMessage.show()
    }
}
function pageSetup() {
    pathFoundMessage.hide()
    noPathFoundMessage.hide()
    network.on('selectNode', function(e) {
        selectedNodes = getSelection(selectedNodes, e.nodes, 'select')
        updateView(selectedNodes)
    })
    network.on('deselectNode', function(e) {
        selectedNodes = getSelection(selectedNodes, e.nodes, 'deselect')
        updateView(selectedNodes)
    })
    var autoCompleteOptions = {
        source: careers,
        minLength: 2
    };
    $(document).on('keydown.autocomplete', 'input.career-search', function() {
        $(this).autocomplete(autoCompleteOptions);
    });
    $("#single-career-search").keyup(function(event){
        if(event.keyCode == 13){
            $("#single-career-search-btn").click();
        }
    });
}

$(function(){
    pageSetup()
})