FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install build dependencies for bcrypt and better-sqlite3
RUN apk add --no-cache python3 make g++

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
