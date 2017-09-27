library(igraph)
library(visNetwork)

roles <- c(1:5)
names(roles) <- c('Academics', 'Warriors', 'Criminals', 'Commoners', 'Rangers')
types <- c(1:2)
names(types) <- c('Basic', 'Advanced')


nodes <- read.csv('data/nodes.csv', as.is = TRUE)
    nodes$label <- nodes$career
    nodes$group <- nodes$roles
    nodes$color <- c('#2E86AB', '#FE7F2D', '#A23B72', '#eddfce', 'C5D86D')[roles[nodes$role]]
    nodes$shape <- c('dot', 'diamond')[types[nodes$type]]
    nodes$size <- c(25,40)[types[nodes$type]]
edges <- read.csv('edgelist_index.csv', as.is = TRUE)
    edges$arrows <- 'to'
    edges$color <- '#aaa'

visNetwork(nodes, edges) #%>%
    #visIgraphLayout('layout_with_fr')