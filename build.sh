#!/usr/bin/env bash
docker-compose down
rm -rf node_modules
rm -rf ./lib/
docker rmi reactproxystate_lib -f
docker rm -f $(docker ps -aq) || true
docker system prune --force
docker-compose up --build
