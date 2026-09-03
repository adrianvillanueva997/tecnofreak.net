#!/bin/sh
set -eu

docker compose pull
docker compose --profile migrate run --rm cms-migrate
docker compose up -d cms
