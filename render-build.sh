#!/bin/bash

# Install dependencies
echo "Installing MySQL and dependencies..."

# Install MySQL server
apt-get update
apt-get install -y mysql-server

# Start MySQL service
service mysql start

# Install Node.js dependencies
npm install

echo "Dependencies installed successfully."

# Run the server
echo "Starting the server..."
npm start
