FROM python:3.10-slim

WORKDIR /app
COPY requirements.txt ./
RUN pip install --upgrade pip && pip install -r requirements.txt
COPY . .

# Set PYTHONPATH to include the current directory
ENV PYTHONPATH=/app

# Flask port
EXPOSE 5000
CMD ["python", "app.py"]
