FROM node:20-slim

# Install dependencies for Prisma and other tools
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy Prisma schema and generating client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy the rest of the application
COPY . .

# Expose the API port
EXPOSE 3000

# Run in development mode
CMD ["npm", "run", "dev"]
