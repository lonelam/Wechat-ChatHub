#!/bin/bash
yarn && yarn build
docker build . -t lonelam/chathub
docker push lonelam/chathub