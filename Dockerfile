# Use the official Node.js image from the Docker Hub
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./
RUN npm install
COPY . .

# Build the Nest.js application
RUN npm run build

# Expose the port that the application will run on
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "start:dev"]