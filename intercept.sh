#!/bin/sh
telepresence intercept huna-huna-gpt --namespace huna --port 3001:http --env-file ./.env || true
