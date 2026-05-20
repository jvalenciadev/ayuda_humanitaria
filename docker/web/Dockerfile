FROM node:18-alpine
WORKDIR /usr/src/app

COPY package*.json ./
COPY apps/web/package*.json ./apps/web/

RUN npm install

COPY apps/web ./apps/web

EXPOSE 3000
CMD ["npm", "run", "dev", "--workspace=apps/web"]
