#!/usr/bin/env bash
yarn install
yarn test
rm -rf node_modules
rm yarn.lock
rm -rf ./lib/
docker rm -f $(docker ps -aq) || true
docker rmi reactproxystate_lib -f
docker system prune --force
docker-compose up --build
