FROM node:22-alpine
WORKDIR /app
# Sample product photos from Unsplash (free Unsplash License), fetched at build time.
# A failed download is skipped; the shop then shows its drawn placeholder instead.
RUN mkdir -p /app/samples && cd /app/samples && \
    for pair in \
      a00000000000000000000001:photo-1593295583578-fda964d48b72 \
      a00000000000000000000002:photo-1548649551-34b3862657b3 \
      a00000000000000000000003:photo-1583937443566-6fe1a1c6e400 \
      a00000000000000000000004:photo-1625627796701-e3c0911b89f3 \
      a00000000000000000000005:photo-1623449634301-5ef15c0ad98e \
      a00000000000000000000006:photo-1639065643006-e217c4fee12e \
      a00000000000000000000007:photo-1693212793204-bcea856c75fe \
      a00000000000000000000008:photo-1535632787350-4e68ef0ac584 \
      a00000000000000000000009:photo-1679156271420-e6c596e9c10a ; do \
      f="${pair%%:*}"; id="${pair#*:}"; \
      wget -q -T 40 -O "$f.jpg" "https://images.unsplash.com/$id?w=1000&h=1250&fit=crop&crop=entropy&fm=jpg&q=82" || rm -f "$f.jpg"; \
    done; ls -la
COPY server.js ./
COPY public ./public
ENV DATA_DIR=/data
CMD ["node", "--disable-warning=ExperimentalWarning", "server.js"]
