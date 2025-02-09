# Use a lightweight Node.js image
FROM node:16-slim

# Install MySQL client
RUN apt-get update && apt-get install -y default-mysql-client && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install --production

# Copy the rest of the app
COPY . .

# Expose port and run server
EXPOSE 3000
CMD ["node", "server.js"]
