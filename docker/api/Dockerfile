FROM node:18-alpine
WORKDIR /usr/src/app

COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY prisma ./prisma/

RUN npm install

COPY apps/api ./apps/api

# Run Prisma generation
RUN npx prisma generate

EXPOSE 3001
CMD ["npm", "run", "dev", "--workspace=apps/api"]
