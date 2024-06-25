
# # Stage 1: Build the Node.js server
# FROM node:latest as server-build

# WORKDIR /app

# COPY server/package.json server/package-lock.json ./
# RUN npm install

# COPY server .
# RUN npm run build

# # Stage 2: Serve with Nginx
# FROM nginx:latest

# # Remove default nginx website
# RUN rm -rf /usr/share/nginx/html/*

# # Copy built Node.js server from Stage 1
# COPY --from=server-build /app/build /app

# # Copy built Angular app from frontend build (assuming you have a separate Dockerfile for frontend)
# COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# # Copy custom Nginx configuration file
# COPY nginx.conf /etc/nginx/nginx.conf

# # Expose ports
# EXPOSE 80

# # Start both Node.js server and Nginx
# CMD service nginx start && node /app/server.js



# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json ./

# Install npm dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port on which the Node.js app runs (if needed, adjust to your app's port)
EXPOSE 5000

# Command to run your Node.js application
CMD ["node", "index.js"]

