# Use official Node.js image
FROM node:20

# Set working directory
WORKDIR /app

# Copy the rest of the application code
COPY . .

# Install dependencies
RUN npm install

# Run migrations
RUN npm install prisma

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "dist/main.js"]
