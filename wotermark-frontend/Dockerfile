FROM node:24.10-alpine AS build

WORKDIR /app

COPY package.json yarn.lock ./

COPY .yarnrc.yml ./
COPY .yarn/ ./.yarn/

RUN yarn install

COPY . .

RUN yarn prepare
RUN yarn build

FROM node:24.10-alpine AS runner

COPY --from=build /app/dist /app/dist

EXPOSE 80

CMD ["npx", "serve", "-s", "/app/dist", "-l", "80"]