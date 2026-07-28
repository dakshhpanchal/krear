FROM python:3.12-slim

RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    libpq-dev \
    libgraphite2-3 \
    libharfbuzz0b \
    libfontconfig1 \
    libicu-dev \
    openssl \
    ca-certificates \
    && curl --proto '=https' --tlsv1.2 -fsSL https://drop-sh.fullyjustified.net | sh \
    && mv tectonic /usr/local/bin/tectonic \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn dj-database-url

COPY . .

COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

EXPOSE 8000

CMD ["./entrypoint.sh"]