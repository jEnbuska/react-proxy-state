#!/usr/bin/env bash
docker rm -f $(docker ps -aq) || true
docker rmi reactproxystate_lib -f
docker system prune
docker-compose up
