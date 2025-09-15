FROM python:3.11-slim

WORKDIR /app

# Install system dependencies including build tools
RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY app.py .
COPY waste_model.h5 .
COPY class_mapping.json .

# Create upload directory
RUN mkdir -p uploads

# Set environment variables to suppress warnings
ENV TF_CPP_MIN_LOG_LEVEL=3
ENV PYTHONWARNINGS="ignore"
ENV GRPC_PYTHON_BUILD_SYSTEM_OPENSSL=1
ENV GRPC_PYTHON_BUILD_SYSTEM_ZLIB=1

EXPOSE 5001

CMD ["python", "app.py"]