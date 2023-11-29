#!/bin/bash

# Build and push the image
yarn && yarn build
docker build . -t lonelam/chathub
docker push lonelam/chathub

# SSH into the server and run docker-compose commands
ssh root@laizn.com << EOF
cd ~/chathub
docker compose pull
docker compose up -d
docker image prune -f
EOF
