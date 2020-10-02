FROM node:8.10-alpine as buildhost
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .
RUN npm run build

FROM nginx
COPY --from=buildhost /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

CMD ["bash", "-c", "envsubst \\$API_HOST < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"];
