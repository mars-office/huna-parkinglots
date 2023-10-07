#!/bin/sh
telepresence connect -n huna
telepresence intercept huna-huna-gpt --port 3001:http --env-file ./.env || true
