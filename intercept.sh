#!/bin/sh
telepresence intercept namespace-release-template-deployable --namespace namespace --port 3000:http --env-file ./.env || true
