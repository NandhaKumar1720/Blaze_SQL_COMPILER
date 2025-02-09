# Use a lightweight Node.js image
FROM node:16-slim

# Install MySQL server
# Install required dependencies
RUN apt-get update && apt-get install -y wget lsb-release gnupg

# Add MySQL APT repository
RUN wget https://dev.mysql.com/get/mysql-apt-config_0.8.26-1_all.deb && \
    dpkg -i mysql-apt-config_0.8.26-1_all.deb && \
    apt-get update

# Install MySQL Server
RUN apt-get install -y mysql-server && rm -rf /var/lib/apt/lists/*


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
