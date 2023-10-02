#!/bin/sh
telepresence intercept huna-huna-gpt --namespace namespace --port 3001:http --env-file ./.env || true
