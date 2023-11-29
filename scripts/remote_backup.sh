#!/bin/bash

# Replace [volume_name] with the name of your Docker volume
VOLUME_NAME=chathub_db_data

# Finding the volume mount point
VOLUME_MOUNTPOINT=$(docker volume inspect $VOLUME_NAME | grep Mountpoint | cut -d '"' -f 4)

# Replace [archive_name] with your desired archive name
ARCHIVE_NAME=chathub_db_data.tar.gz

# Creating a compressed archive of the volume
tar czvf $ARCHIVE_NAME $VOLUME_MOUNTPOINT

echo "Archive created: $ARCHIVE_NAME"
