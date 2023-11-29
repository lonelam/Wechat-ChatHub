#!/bin/bash

# Replace [remote_user] and [remote_host] with your remote SSH login info
REMOTE_USER=root
REMOTE_HOST=laizn.com

# Replace [archive_name] with the name of your archive
ARCHIVE_NAME=chathub_db_data.tar.gz

# Replace [new_volume_name] with the name of the new Docker volume
NEW_VOLUME_NAME=chathub_db_data

# SCP command to transfer the archive from the remote server
scp $REMOTE_USER@$REMOTE_HOST:/tmp/$ARCHIVE_NAME .

# Creating a new Docker volume
docker volume create $NEW_VOLUME_NAME

# Finding the new volume's mount point
NEW_VOLUME_MOUNTPOINT=$(docker volume inspect $NEW_VOLUME_NAME | grep Mountpoint | cut -d '"' -f 4)

# Extracting the archive into the new volume's mount point
sudo tar xzvf $ARCHIVE_NAME -C $NEW_VOLUME_MOUNTPOINT

echo "Volume restored: $NEW_VOLUME_NAME"
