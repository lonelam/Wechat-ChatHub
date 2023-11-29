#!/bin/bash

VOLUME_NAME="chathub_db_data"
ARCHIVE_NAME="/tmp/chathub_db_data.tar.gz"

# Finding the volume mount point
VOLUME_MOUNTPOINT=$(docker volume inspect "$VOLUME_NAME" -f '{{ .Mountpoint }}')
if [ $? -ne 0 ]; then
    echo "Error: Failed to find the mount point of the volume."
    exit 1
fi

# Change to the directory containing the volume data
cd "$VOLUME_MOUNTPOINT" || exit

# Creating a compressed archive of the volume
tar czvf "$ARCHIVE_NAME" . || exit

echo "Archive created: $ARCHIVE_NAME"

