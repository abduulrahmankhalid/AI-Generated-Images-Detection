import boto3
import os
import sys

def download_model_from_s3():
    """
    Downloads model from S3 using environment variables:
    - MODEL_S3_BUCKET: S3 bucket name
    - MODEL_S3_KEY: S3 object key (path to model file)
    """
    try:
        bucket = os.environ.get('MODEL_S3_BUCKET')
        key = os.environ.get('MODEL_S3_KEY')
        model_path = os.environ.get('MODEL_PATH', '/app/models/model.onnx')
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        
        print(f"Downloading model from s3://{bucket}/{key} to {model_path}...")
        
        # Create S3 client
        s3 = boto3.client('s3')
        
        # Download model file
        s3.download_file(bucket, key, model_path)
        
        print(f"Model downloaded successfully to {model_path}")
        return True
        
    except Exception as e:
        print(f"Error downloading model: {str(e)}")
        return False

if __name__ == "__main__":
    # If running as script, download model and exit with status code
    success = download_model_from_s3()
    sys.exit(0 if success else 1)