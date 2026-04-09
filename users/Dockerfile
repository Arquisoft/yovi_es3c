FROM node:22-alpine
WORKDIR /app

# Argumentos de build para variables de entorno
ARG JWT_SECRET
ARG MONGO_URL

COPY package.json package-lock.json ./
RUN npm ci --silent

COPY . .

# Establecer variables de entorno desde argumentos
ENV JWT_SECRET=${JWT_SECRET}
ENV MONGO_URL=${MONGO_URL}

EXPOSE 3000
CMD ["node", "users-service.js"]
