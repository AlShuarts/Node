FROM ubuntu:22.04

# Éviter les prompts interactifs pendant l'installation
ENV DEBIAN_FRONTEND=noninteractive

# Installation de curl et des dépendances pour Node.js
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    gnupg

# Ajout du repository NodeSource pour Node.js 18
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -

# Installation de Node.js 18 et des autres dépendances
RUN apt-get install -y \
    nodejs \
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
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

# Vérification de la version de Node.js
RUN node --version

WORKDIR /app

# Installation des dépendances Node.js
COPY package*.json ./
RUN npm install

# Copie du reste du code
COPY . .

# Configuration de Xvfb pour le rendu hors écran
ENV DISPLAY=:99

# Script de démarrage avec nettoyage du lock file
CMD rm -f /tmp/.X99-lock && Xvfb :99 -screen 0 1280x720x24 & npm start
