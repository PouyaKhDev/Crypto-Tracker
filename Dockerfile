FROM python:3.12-slim
LABEL maintainer="PouyaKhajaviDev"

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

COPY ./requirements.txt /tmp/requirements.txt
COPY ./app /app

WORKDIR /app
EXPOSE 8000


RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    nodejs npm gcc python3-dev libpq-dev && \
    pip install --upgrade pip && \
    pip install --no-cache-dir -r /tmp/requirements.txt && \
    chmod +x /app/entrypoint.sh && \
    rm -f /tmp/requirements.txt && \
    apt-get purge -y --auto-remove gcc python3-dev

ENTRYPOINT ["sh", "/app/entrypoint.sh"]

