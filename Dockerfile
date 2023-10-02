FROM node:lts-alpine
WORKDIR /app
COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
RUN npm i
COPY . .
RUN npm run build
RUN npm run test

CMD npm run prod

EXPOSE 3001
LABEL org.opencontainers.image.source=https://github.com/mars-office/huna-gpt