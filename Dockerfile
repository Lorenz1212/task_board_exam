# Use a very stable Debian-based slim image
FROM node:20-bullseye-slim

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate || true

EXPOSE 3000

CMD ["npm", "run", "dev"]