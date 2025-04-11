#!/bin/bash

# Create models directory
mkdir -p /app/models

# Download model using Python instead of AWS CLI
echo "Downloading model using boto3..."
python /app/download_model.py

# Check if the model was downloaded successfully
if [ $? -ne 0 ]; then
  echo "Error downloading model. Exiting."
  exit 1
fi

# Set model path environment variable
export MODEL_PATH="/app/models/model.onnx"

# Check if the model exists
if [ -f "$MODEL_PATH" ]; then
  echo "Model path set to: $MODEL_PATH"
else
  echo "Model file not found at $MODEL_PATH. Exiting."
  exit 1
fi

# Start the application
exec uvicorn main:app --host 0.0.0.0 --port 8000