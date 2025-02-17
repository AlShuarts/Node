FROM node:18-bullseye-slim

# Installation des dépendances système nécessaires
RUN apt-get update && apt-get install -y \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libxtst6 \
    libfreetype6 \
    libx11-6 \
    xvfb \
    libxss1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Installation des dépendances Node.js
COPY package*.json ./
RUN npm install

# Copie du reste du code
COPY . .

# Configuration de Xvfb pour le rendu hors écran
ENV DISPLAY=:99

# Script de démarrage
CMD Xvfb :99 -screen 0 1280x720x24 & npm start
