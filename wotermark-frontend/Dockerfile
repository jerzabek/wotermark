FROM node:22-alpine AS build

WORKDIR /app

COPY package.json yarn.lock ./

COPY .yarnrc.yml ./
COPY .yarn/ ./.yarn/

RUN yarn install

COPY . .

RUN yarn prepare
RUN yarn build

FROM nginx:alpine AS runner

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]