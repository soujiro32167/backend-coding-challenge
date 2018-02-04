db = db.getSiblingDB('coveo')
db.geodata.find({name: /.*Londo.*/i, loc: {$nearSphere: [-79.4163, 43.70011]}}, {name: 1, country: 1, admin1: 1, loc: 1}).explain("executionStats")