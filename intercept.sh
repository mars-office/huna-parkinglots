#!/bin/sh
telepresence connect -n huna
telepresence intercept huna-huna-parkinglots --port 3002:http --to-pod 8181 --env-file ./.env || true
