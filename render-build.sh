#!/bin/bash

# Install dependencies for MySQL and Node.js
echo "Installing dependencies..."

# Install MySQL client
apt-get update
apt-get install -y default-mysql-client build-essential

# Install Node.js dependencies
npm install

echo "Dependencies installed successfully."

# Run the server
echo "Starting the server..."
npm start
