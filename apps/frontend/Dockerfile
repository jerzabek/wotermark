FROM node:24.10-alpine AS build

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/ ./.yarn/

RUN yarn install

COPY . .

# Generates the Panda styled-system, then produces the static export in ./out
RUN yarn build

FROM node:24.10-alpine AS runner

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/out ./out

EXPOSE 80

CMD ["serve", "out", "-l", "80"]
