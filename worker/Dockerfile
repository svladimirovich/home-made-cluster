FROM node:8.10-alpine
WORKDIR /app
ADD package.json .
RUN npm install
COPY . .
CMD ["npm", "start"];