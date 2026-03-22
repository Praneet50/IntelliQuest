FROM node:18

# Install OCR dependencies used by runtime checks and OCR pipeline.
RUN apt-get update && apt-get install -y --no-install-recommends \
    ghostscript \
    graphicsmagick \
    tesseract-ocr \
    tesseract-ocr-eng \
 && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the code
COPY . .

# Expose port
EXPOSE 5001

# Start dev server (nodemon)
CMD ["npm", "run", "dev"]