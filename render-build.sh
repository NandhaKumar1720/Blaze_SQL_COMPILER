#!/bin/bash

# Install dependencies
echo "Installing MariaDB and dependencies..."

# Install MariaDB server
apt-get update
apt-get install -y mariadb-server

# Start MariaDB service
service mariadb start

# Install Node.js dependencies
npm install

echo "Dependencies installed successfully."

# Run the server
echo "Starting the server..."
npm start
