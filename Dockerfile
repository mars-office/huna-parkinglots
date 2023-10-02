FROM alpine:latest
ENTRYPOINT ["/bin/ash", "-c", "sleep infinity"]
EXPOSE 3000
LABEL org.opencontainers.image.source=https://github.com/mars-office/template-deployable