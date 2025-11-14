#!/usr/bin/env bash
set -euo pipefail

# Builds the docker-compose services and pushes tagged images
# to the DigitalOcean registry.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

PROJECT_NAME="${COMPOSE_PROJECT_NAME:-vanx-chat}"
REGISTRY="${REGISTRY:-registry.digitalocean.com/vanx}"
IMAGE_TAG="${IMAGE_TAG:-${1:-latest}}"
TARGET_PLATFORM="${TARGET_PLATFORM:-linux/amd64}"

if [[ -n "${SERVICES_OVERRIDE:-}" ]]; then
  read -r -a SERVICES <<< "${SERVICES_OVERRIDE}"
else
  SERVICES=(api web www)
fi

echo "==> Building services (${TARGET_PLATFORM}): ${SERVICES[*]}"
DOCKER_DEFAULT_PLATFORM="${TARGET_PLATFORM}" docker compose build "${SERVICES[@]}"

for service in "${SERVICES[@]}"; do
  local_image="${PROJECT_NAME}-${service}:latest"
  remote_image="${REGISTRY}/vanx-chat-${service}:${IMAGE_TAG}"

  echo "==> Tagging ${local_image} -> ${remote_image}"
  docker tag "${local_image}" "${remote_image}"

  echo "==> Pushing ${remote_image}"
  docker push "${remote_image}"
done

echo "✅ All images pushed with tag '${IMAGE_TAG}'"
