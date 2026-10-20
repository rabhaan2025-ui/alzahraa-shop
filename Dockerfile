FROM node:22-alpine
WORKDIR /app
COPY server.js ./
COPY public ./public
# Sample product photos (Unsplash License, backgrounds removed; see tools/).
COPY samples ./samples
ENV DATA_DIR=/data
CMD ["node", "--disable-warning=ExperimentalWarning", "server.js"]
