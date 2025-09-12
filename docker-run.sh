#!/usr/bin/env bash
set -euo pipefail

# Simple helper to build and run the Next.js app in Docker.

APP_NAME="fe-parthamanunggal"
IMAGE_TAG="${IMAGE_TAG:-${APP_NAME}:latest}"
CONTAINER_NAME="${CONTAINER_NAME:-${APP_NAME}}"
PORT="${PORT:-3000}"
INTERNAL_API_BASE_URL_DEFAULT="http://host.docker.internal:8000"

command_exists() { command -v "$1" >/dev/null 2>&1; }

compose_cmd() {
  if command_exists docker; then
    if docker compose version >/dev/null 2>&1; then
      echo "docker compose"
      return
    fi
  fi
  if command_exists docker-compose; then
    echo "docker-compose"
    return
  fi
  echo "" # none
}

container_exists() {
  docker ps -a --format '{{.Names}}' | grep -Eq "^${CONTAINER_NAME}$"
}

container_running() {
  docker ps --format '{{.Names}}' | grep -Eq "^${CONTAINER_NAME}$"
}

ensure_docker() {
  if ! command_exists docker; then
    echo "Error: docker not found in PATH" >&2
    exit 1
  fi
}

build() {
  ensure_docker
  echo "[docker-run] Building image: ${IMAGE_TAG}"
  local nocache_flag=()
  if [[ "${NO_CACHE:-0}" == "1" ]]; then
    nocache_flag+=("--no-cache")
  fi
  docker build "${nocache_flag[@]}" \
    --build-arg NEXT_PUBLIC_API_BASE_URL="${NEXT_PUBLIC_API_BASE_URL:-http://localhost:8000}" \
    --build-arg NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:8000}" \
    --build-arg NEXT_PUBLIC_USE_SERVER_AUTH="${NEXT_PUBLIC_USE_SERVER_AUTH:-1}" \
    --build-arg NEXT_PUBLIC_USE_SANCTUM="${NEXT_PUBLIC_USE_SANCTUM:-1}" \
    --build-arg NEXT_PUBLIC_AUTO_LOGIN="${NEXT_PUBLIC_AUTO_LOGIN:-1}" \
    --build-arg NEXT_PUBLIC_AUTO_LOGIN_EMAIL="${NEXT_PUBLIC_AUTO_LOGIN_EMAIL:-admin@example.com}" \
    --build-arg NEXT_PUBLIC_AUTO_LOGIN_PASSWORD="${NEXT_PUBLIC_AUTO_LOGIN_PASSWORD:-password}" \
    --build-arg INTERNAL_API_BASE_URL="${INTERNAL_API_BASE_URL:-${INTERNAL_API_BASE_URL_DEFAULT}}" \
    --build-arg BUILD_ID="$(date +%s)" \
    -t "${IMAGE_TAG}" .
}

run() {
  ensure_docker
  local env_args=()
  # Load env files if present
  if [[ -f .env ]]; then env_args+=("--env-file" ".env"); fi
  if [[ -f .env.local ]]; then env_args+=("--env-file" ".env.local"); fi

  echo "[docker-run] Starting container: ${CONTAINER_NAME} (port ${PORT})"
  docker run -d \
    --name "${CONTAINER_NAME}" \
    --restart unless-stopped \
    -p "${PORT}:3000" \
    -e INTERNAL_API_BASE_URL="${INTERNAL_API_BASE_URL:-${INTERNAL_API_BASE_URL_DEFAULT}}" \
    "${env_args[@]}" \
    "${IMAGE_TAG}"

  echo "[docker-run] Logs: docker logs -f ${CONTAINER_NAME}"
}

stop() {
  ensure_docker
  if container_running; then
    echo "[docker-run] Stopping container: ${CONTAINER_NAME}"
    docker stop "${CONTAINER_NAME}" >/dev/null
  fi
  if container_exists; then
    echo "[docker-run] Removing container: ${CONTAINER_NAME}"
    docker rm "${CONTAINER_NAME}" >/dev/null
  fi
}

logs() {
  ensure_docker
  docker logs -f "${CONTAINER_NAME}"
}

shell_in() {
  ensure_docker
  local shell="/bin/sh"
  if docker exec "${CONTAINER_NAME}" command -v bash >/dev/null 2>&1; then
    shell="/bin/bash"
  fi
  docker exec -it "${CONTAINER_NAME}" "${shell}"
}

compose_up() {
  local cmd
  cmd=$(compose_cmd)
  if [[ -z "${cmd}" ]]; then
    echo "Error: docker compose not found" >&2
    exit 1
  fi
  echo "[docker-run] Using ${cmd} up --build -d"
  ${cmd} up --build -d
}

compose_down() {
  local cmd
  cmd=$(compose_cmd)
  if [[ -z "${cmd}" ]]; then
    echo "Error: docker compose not found" >&2
    exit 1
  fi
  echo "[docker-run] Using ${cmd} down"
  ${cmd} down
}

usage() {
  cat <<EOF
Usage: ${0##*/} <command>

Commands:
  up            Stop old container, rebuild image, run new container (default)
  build         Build the Docker image only
  run           Run the container from existing image
  stop          Stop and remove the container
  logs          Follow container logs
  sh            Exec into the container shell
  compose-up    Use docker compose to build and start
  compose-down  Use docker compose to stop

Environment variables:
  IMAGE_TAG        Image tag (default: ${IMAGE_TAG})
  CONTAINER_NAME   Container name (default: ${CONTAINER_NAME})
  PORT             Host port to bind (default: ${PORT})

Examples:
  PORT=4000 ${0##*/} up
  IMAGE_TAG=${APP_NAME}:dev ${0##*/} build
  ${0##*/} compose-up
EOF
}

up() {
  stop
  build
  run
}

cmd="${1:-up}"
case "${cmd}" in
  up)
    up
    ;;
  build)
    build
    ;;
  run)
    run
    ;;
  stop)
    stop
    ;;
  logs)
    logs
    ;;
  sh)
    shell_in
    ;;
  compose-up)
    compose_up
    ;;
  compose-down)
    compose_down
    ;;
  -h|--help|help)
    usage
    ;;
  *)
    echo "Unknown command: ${cmd}" >&2
    usage
    exit 1
    ;;
esac

