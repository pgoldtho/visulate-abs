#!/bin/bash
#
# Download bulk submissions data from https://www.sec.gov/Archives/edgar/daily-index/bulkdata/submissions.zip
# Expand into empty directory then copy files with ABS-EE references into a new directory
# find . -type f -exec grep -l "ABS-EE" {} + | xargs cp -t /zfspool/sec/abs-ee-submissions/
#
# Usage: ./get-abs-submissions.sh <stage_dir> <target_dir>
# Example: ./get-abs-submissions.sh /zfspool/sec/stage /zfspool/sec/abs-ee-submissions
#
# Note: submissions.zip is 1.2GB and expands to 8.9GB


# Ensure two arguments are passed
if [ "$#" -ne 2 ]; then
    echo "Enter a stage directory and an target directory.
    Usage: $0 <stage_dir> <target_dir>"
    exit 1
fi

stage_dir="$1"
target_dir="$2"
zip_url="https://www.sec.gov/Archives/edgar/daily-index/bulkdata/submissions.zip"  # SEC submissions zip file

# Check if stage_dir exists, if not create it
# If exists, check if it is empty
if [ ! -d "$stage_dir" ]; then
    mkdir -p "$stage_dir"
elif [ "$(ls -A $stage_dir)" ]; then
    echo "Directory $stage_dir is not empty. Exiting."
    exit 1
fi

echo "Downloading $zip_url to $stage_dir/submissions.zip"

response=$(curl -A "Visulate peter@visulate.com" -w "%{http_code}" -o "$stage_dir/submissions.zip" "$zip_url" -s -S 2>&1)
status=${response: -3}
message=${response%???}

if [ "$status" -ne 200 ]; then
    echo "Failed to download the file. HTTP status code: $status"
    echo "Error message: $message"
    exit 1
fi

echo "Download complete. Unzipping ..."

# Unzip the file
unzip "$stage_dir/submissions.zip" -d "$stage_dir"

# Check if target_dir exists, if not create it
# If exists, check if it is empty
if [ ! -d "$target_dir" ]; then
    mkdir -p "$target_dir"
elif [ "$(ls -A $target_dir)" ]; then
    echo "Directory $target_dir is not empty. Exiting."
    exit 1
fi

echo "Copying files with ABS-EE references to $target_dir"

# Grep and copy the matching files
find "$stage_dir" -name "*.json" -type f -print0 | xargs -0 grep -l 'ABS-EE' | while read -r file
do
    cp "$file" "$target_dir/"
done
