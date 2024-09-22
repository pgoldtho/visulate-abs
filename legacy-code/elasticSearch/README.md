# Patches and Updates

## Update ElasticSearch version on Mac

1.  Download and unzip latest zipfile
2.  Stop elasticSearch
3.  Copy data directory
4.  cd to new directory
5.  ES_JAVA_OPTS="-XX:-MaxFDLimit" ./bin/elasticsearch

## Update 1 - Fix duplicate property names and remove trailing spaces from use types

```
curl -X PUT http://localhost:9200/cmbs2 -d @elasticSearchMapping.json  -H 'Content-Type: application/json'

curl -X POST "localhost:9200/_reindex" -H 'Content-Type: application/json' -d'
{
  "source": {
    "index": "cmbs"
  },
  "dest": {
    "index": "cmbs2"
  }
}
'

```
