# Use a lightweight Node.js image
FROM node:16-slim

# Install required dependencies
RUN apt-get update && apt-get install -y wget gnupg lsb-release

# Add MySQL APT repository manually
RUN wget https://dev.mysql.com/get/mysql-apt-config_0.8.26-1_all.deb && \
    dpkg -i mysql-apt-config_0.8.26-1_all.deb && \
    rm -f mysql-apt-config_0.8.26-1_all.deb

# Fix the GPG key issue by adding it manually
RUN wget -O /etc/apt/trusted.gpg.d/mysql.gpg https://repo.mysql.com/RPM-GPG-KEY-mysql-2022 && \
    apt-key add /etc/apt/trusted.gpg.d/mysql.gpg

# Update and install MySQL server
RUN apt-get update && apt-get install -y mysql-server && rm -rf /var/lib/apt/lists/*

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
