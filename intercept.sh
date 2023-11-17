#!/bin/sh
telepresence connect -n huna
telepresence intercept huna-huna-gpt --port 3001:http --to-pod 8181 --env-file ./.env || true
