FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    imagemagick \
    libmagickwand-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt optional-requirements.txt ./

# Base requirements + OAuth optional deps
RUN pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir \
        "Flask-Dance>=2.0.0,<7.2.0" \
        "SQLAlchemy-Utils>=0.33.5,<0.43.0"

COPY . .

VOLUME ["/config", "/books"]

EXPOSE 8083

ENV CALIBRE_DBPATH=/config

CMD ["python", "cps.py"]
