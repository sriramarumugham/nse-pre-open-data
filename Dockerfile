# Base: slim Node for small footprint
FROM node:18-slim

# Install system deps (just what Playwright needs + xvfb)
RUN apt-get update && apt-get install -y \
    wget gnupg xvfb \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 \
    libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 \
    libxfixes3 libxrandr2 libgbm1 libasound2 \
    fonts-liberation libgtk-3-0 libxshmfence1 \
    && rm -rf /var/lib/apt/lists/*

# Install Playwright (only Chromium for smallest size)
RUN npm install -g playwright \
    && npx playwright install chromium --with-deps

# Set working dir
WORKDIR /app
COPY . .

# Default command runs with virtual display (headed mode)
CMD ["xvfb-run", "--server-args=-screen 0 1920x1080x24", "node", "index.js"]
