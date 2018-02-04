# Research

## Database (or indexer)

**Requirements**
1. Scale - maintain similar performance with 10x - 100x more data
2. Performance - reasonable query time: say 100ms (based on HTTP response in 500ms+-100ms)
3. Cloud hosting (bonus) - a pre-existing could hosted database decreases operations costs and makes scaling easier

### Mongodb
1. Has a full-text index with fuzzy matches via wildcards. However, score only applies to word match. **DISQUALIFIED**
2. Worse, fuzzy match does not participate in text index (need to create a separate index)
3. Has geospatial index for fast geometry search
4. Execution time: ~7ms without query on geo index 

```
Cluster0-shard-0:PRIMARY> db.geodata.find({$text: { $search: "London" }}, {score: {$meta: "textScore"}, name: 1, id: 1}  ).sort( { score: { $meta: "textScore" } } )
{ "_id" : ObjectId("5a7248e3d61655f6fb18464e"), "id" : 6058560, "name" : "London", "score" : 2.7192307692307693 }
{ "_id" : ObjectId("5a7248e4d61655f6fb1852de"), "id" : 4839416, "name" : "New London", "score" : 2.45703125 }
{ "_id" : ObjectId("5a7248e4d61655f6fb184b7b"), "id" : 4298960, "name" : "London", "score" : 2.2 }
{ "_id" : ObjectId("5a7248e4d61655f6fb184edb"), "id" : 4517009, "name" : "London", "score" : 2.2 }
{ "_id" : ObjectId("5a7248e5d61655f6fb185c2f"), "id" : 5264455, "name" : "New London", "score" : 2.125 }
Cluster0-shard-0:PRIMARY> db.geodata.find({$text: { $search: "Londo" }}, {score: {$meta: "textScore"}, name: 1, id: 1}  ).sort( { score: { $meta: "textScore" } } )
Cluster0-shard-0:PRIMARY>
```

### MySQL
1. Has a full-text index with fuzzy matches via wildcards. However, score only applies to word match. **DISQUALIFIED**
2. Has geospatial index for fast geometry search
3. Execution time: 14ms with spatial and full text


```
SELECT 
		MATCH (name, ascii, alt_name) AGAINST ('*Londo*' in boolean mode) as full_index_match,
		MATCH (name)  AGAINST ('*Londo*' in boolean mode) as name_score, 
		MATCH (ascii)  AGAINST ('*Londo*' in boolean mode) as ascii_score,
		MATCH (alt_name)  AGAINST ('*Londo*' in boolean mode) as alt_name_score,
		ST_Distance_Sphere(Point(-79.4163, 43.70011), t.loc) / 1000 as distance_km,
		name, ascii, country, admin1, alt_name,id
		FROM coveo.cities_canada_usa as t
		WHERE 
			#MATCH (name)  AGAINST ('*Нью-Лондон*' in boolean mode) OR
			#MATCH (ascii)  AGAINST ('*Нью-Лондон*' in boolean mode) OR
			#MATCH (alt_name)  AGAINST ('*Нью-Лондон*' in boolean mode)
            MATCH (name, ascii, alt_name)  AGAINST ('*Londo*' in boolean mode);
```
            
```
39.03873062133789	8.94326400756836	8.94326400756836	26.82979393005371	653.4877270519999	New London	US	CT
23.42323875427246	8.94326400756836	8.94326400756836	8.94326400756836	748.7317436839145	New London	US	WI
23.42323875427246	8.94326400756836	8.94326400756836	8.94326400756836	167.1355555730732	London	CA	8
15.615492820739746	8.94326400756836	8.94326400756836	0	830.3107472052304	              London	US	KY
15.615492820739746	8.94326400756836	8.94326400756836	0	581.4980110549111	              Londontowne	US	MD
15.615492820739746	8.94326400756836	8.94326400756836	0	539.8071667575146	               London	US	OH
7.807746410369873	8.94326400756836	8.94326400756836	8.94326400756836	657.3272382430591	Londonderry	US	NH
```


### AWS Athena
1. Is not idea for full text search, more useful for doing SQL on a file **DISQUALIFIED**


### Elasticsearch (Lucene)
1. Supports partial match and geo index with flexible scoring (weights on each field)
2. Steep learning curve - could not master it in time to make it usefult
3. Had difficulty loading data

### In-memory
1. Simple naive approach: load csv and query **SELECTED**


## Application engine
## Cloud platform
## Additional features
