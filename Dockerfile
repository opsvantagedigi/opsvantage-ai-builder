FROM node:20-alpine

# Add this line to fix the Prisma OpenSSL error
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files
COPY package*.json ./

# The "Nuclear" fix for the Windows/Linux conflict
RUN npm install --no-package-lock --include=optional --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Force Webpack at the CLI level to stop Turbopack from taking over
RUN npx next build --webpack

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]