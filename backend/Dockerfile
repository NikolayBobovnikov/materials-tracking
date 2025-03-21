FROM python:3.10-slim

WORKDIR /app

# Install wget for healthcheck
RUN apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --upgrade pip && pip install -r requirements.txt
COPY . .

# Set PYTHONPATH to include the current directory
ENV PYTHONPATH=/app
ENV FLASK_APP=app.py

# Flask port
EXPOSE 5000
# Set up database and run Flask
CMD flask db upgrade && flask run --host=0.0.0.0
