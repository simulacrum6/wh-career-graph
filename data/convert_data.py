import pandas as pd
import numpy as np
import networkx as nx
import os.path as path

colors = {
    'Academics': '#2E86AB',
    'Warriors': '#FE7F2D',
    'Criminals': '#A23B72',
    'Commoners': '#EDDFCE',
    'Rangers': '#C5D86D'
}
shapes = {
    'Basic': 'dot',
    'Advanced': 'diamond'
}

nodes = pd.read_csv('careers.csv', sep=';')
nodes['label'] = nodes['career']
nodes['color'] = [colors[entry] for entry in nodes['role']]
nodes['shape'] = [shapes[entry] for entry in nodes['type']]

id_name = {index:name for index,name in zip(nodes.id,nodes.career)}
name_id = {name:index for index,name in zip(nodes.id,nodes.career)}

edgelist_index = set()
edgelist_name = set()

for i,row in nodes.iterrows():
    exits = row.exits.split(', ')
    name = row['career']
    index = row['id']
    for e in exits:
        if name_id.get(e, False):
            edgelist_index.add((index, name_id[e], 1, '{0}--{1}'.format(index, name_id[e])))
            edgelist_name.add((name, e, 1, '{0}--{1}'.format(name, e)))

pd.DataFrame(list(edgelist_index), columns=['from','to', 'weight', 'id']).to_csv('edgelist_index.csv', index=False)
pd.DataFrame(list(edgelist_index), columns=['from','to', 'weight', 'id']).to_json('edgelist_index.json', orient='records')
pd.DataFrame(list(edgelist_name), columns=['from','to', 'weight', 'id']).to_csv('edgelist_name.csv', index=False)

nodes[['id', 'career', 'type', 'role']].to_csv('nodes.csv', index=False)
nodes[['id', 'label', 'color', 'shape', 'career', 'type', 'role']].to_json('nodes.json', orient='records')

basic_filter = [
    'Agitator',
    'Apprentice Wizard',
    'Bailiff',
    'Barber-Surgeon',
    'Boatman',
    'Bodyguard',
    'Bone Picker',
    'Bounty Hunter',
    'Burgher',
    'Camp Follower',
    'Charcoal-Burner',
    'Coachman',
    'Entertainer',
    'Envoy',
    'Estalian Diestro',
    'Ferryman',
    'Fieldwarden',
    'Fisherman',
    'Grave Robber',
    'Hedge Wizard',
    'Hunter',
    'Initiate',
    'Jailer',
    'Kislevite Kossar',
    'Kithband Warrior',
    'Marine',
    'Mercenary',
    'Messenger',
    'Militiaman',
    'Miner',
    'Noble',
    'Norse Berserker',
    'Outlaw',
    'Outrider',
    'Peasant',
    'Pit Fighter',
    'Protagonist',
    'Rat Catcher',
    'Roadwarden',
    'Rogue',
    'Runebearer',
    'Scribe',
    'Seaman',
    'Servant',
    'Shieldbreaker',
    'Smuggler',
    'Soldier',
    'Squire',
    'Student',
    'Thief',
    'Thug',
    'Toll Keeper',
    'Tomb Robber',
    'Tradesman',
    'Troll Slayer',
    'Vagabond',
    'Valet',
    'Watchman',
    'Woodsman',
    'Zealot',
    'Anointed Priest',
    'Artisan',
    'Assassin',
    'Captain',
    'Cat Burglar',
    'Champion',
    'Charlatan',
    'Courtier',
    'Crime Lord',
    'Daemon Slayer',
    'Demagogue',
    'Duellist',
    'Engineer',
    'Explorer',
    'Fence',
    'Flagellant',
    'Friar',
    'Ghost Strider',
    'Giant Slayer',
    'Guild Master',
    'Herald',
    'High Priest',
    'Highwayman',
    'Innkeeper',
    'Interrogator',
    'Journeyman Wizard',
    'Judicial Champion',
    'Knight',
    'Knight of the Inner Circle',
    'Master Thief',
    'Master Wizard',
    'Mate',
    'Merchant',
    'Minstrel',
    'Navigator',
    'Noble Lord',
    'Outlaw Chief',
    'Physician',
    'Pistolier',
    'Politician',
    'Priest',
    'Racketeer',
    'Scholar',
    'Scout',
    'Sea Captain',
    'Sergeant',
    'Spy',
    'Steward',
    'Targeteer',
    'Vampire Hunter',
    'Veteran',
    'Witch Hunter',
    'Wizard Lord'
]