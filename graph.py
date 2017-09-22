import pandas as pd
import numpy as np
import networkx as nx

nodes = pd.read_csv('data.csv', sep=';')

id_name = {index:name for index,name in zip(nodes.id,nodes.name)}
name_id = {name:index for index,name in zip(nodes.id,nodes.name)}

edgelist_index = set()
edgelist_name = set()

for i,row in nodes.iterrows():
    exits = row.exits.split(', ')
    name = row['career']
    index = row['id']
    for e in exits:
        if name_id.get(e, False):
            edgelist_index.add((index, name_id[e]))
            edgelist_name.add((name, e))

pd.DataFrame(list(edgelist_index), columns=['from','to']).to_csv('edgelist_index.csv', index=False)
pd.DataFrame(list(edgelist_name), columns=['from','to']).to_csv('edgelist_name.csv', index=False)
nodes[['id', 'career', 'type', 'role']].to_csv('nodes.csv', index=False)