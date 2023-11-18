FROM node:alpine
WORKDIR /app
COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
RUN npm i
COPY . .
RUN npm run build
ARG TARGETPLATFORM
RUN if [ "$TARGETPLATFORM" = "linux/amd64" ]; then \
    npm run test \
  fi

CMD npm run prod

EXPOSE 3001
LABEL org.opencontainers.image.source=https://github.com/mars-office/huna-gpt