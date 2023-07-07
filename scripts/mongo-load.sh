#!/bin/bash
# Load JSON files into MongoDB
# Usage: ./mongo-load.sh <directory> <MongoDB URI> <collection>
# Example: ./mongo-load.sh /zfspool/sec/abs-ee-submissions mongodb://localhost:27017/sec abs_ee_submissions

# Ensure two arguments are passed
if [ "$#" -ne 3 ]; then
    echo "You must enter exactly 3 arguments: directory, MongoDB URI, and collection"
    exit 1
fi

dir="$1"
mongo_uri="$2"
collection="$3"

# Check if dir exists and is not empty
if [ ! -d "$dir" ] || [ -z "$(ls -A $dir)" ]; then
    echo "Directory $dir does not exist or is empty. Exiting."
    exit 1
fi

# Loop over all .json files in the directory
for file in "$dir"/*.json; do
    if [ -f "$file" ]; then
        echo "Importing $file into MongoDB..."
        mongoimport --uri "$mongo_uri" --collection "$collection" --file "$file" --jsonArray
    fi
done

echo "All JSON files have been imported into MongoDB."
