from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from contextlib import asynccontextmanager
import gc
import time
import shutil
import os
import uuid
import numpy as np
from PIL import Image
import onnxruntime


# Defining Constants
# MODEL_PATH = os.environ.get("MODEL_PATH", "models/model.h5") 
MODEL_PATH = "models/model.onnx"  
CLASS_NAMES = ["Human", "AI"]         
IMG_SHAPE = 224                       

    
def load_prep_image(filename, img_shape=224):
    """
    Reads an image from filename, preprocesses it, and reshapes it to
    (1, img_shape, img_shape, 3) for model input.
    
    Args:
        filename (str): Path to the image file.
        img_shape (int): Target size for resizing the image.
    
    Returns:
        np.ndarray: Preprocessed image array, or None if an error occurs.
    """
    try:
        with Image.open(filename) as img:
            # Convert to RGB
            img = img.convert('RGB')

            # Resize to the target shape using bilinear interpolation
            img = img.resize((img_shape, img_shape), resample=Image.BILINEAR)

            # Convert to a NumPy array with uint8 type
            img_array = np.array(img, dtype='float32')

            # Add batch dimension (shape becomes (1, img_shape, img_shape, 3))
            img_array = np.expand_dims(img_array, axis=0)

        return img_array
    except Exception as e:
        print(f"Error loading image: {e}")
        return None    


# Load the model once at startup
try:
    # Initialize the ONNX runtime session once at startup
    # Create session options with optimizations
    session_options = onnxruntime.SessionOptions()
    session_options.graph_optimization_level = onnxruntime.GraphOptimizationLevel.ORT_ENABLE_ALL
    session_options.enable_mem_pattern = True
    session_options.enable_cpu_mem_arena = True
    
    # Initialize optimized session
    session = onnxruntime.InferenceSession(
        MODEL_PATH, 
        sess_options=session_options,
        providers=['CPUExecutionProvider']
    )
    
    input_name = session.get_inputs()[0].name
    input_shape = session.get_inputs()[0].shape
    # Check if the input shape is as expected
    print(f"Model expects input shape: {input_shape}")
    print(f"Model Input name: {input_name}")
except Exception as e:
    raise RuntimeError(f"Failed to load model: {e}")

# Define lifespan context manager instead of deprecated on_event
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifecycle manager for the FastAPI application.
    - Handles model warmup on startup
    - Ensures model is ready for fast inference
    - Performs cleanup on shutdown
    """
    # Startup code - comprehensive model warmup
    print("Starting model warmup...")
    
    # Load and preprocess a sample image
    preprocessed_img = load_prep_image('static/images/about.jpeg')
    
    # Multiple predictions to ensure TensorFlow optimization compilation is complete
    for i in range(3):
        start = time.time()
        result = session.run(None, {input_name: preprocessed_img})
        print(f"Warmup prediction {i+1}: {time.time() - start:.4f} seconds")
    
    # Force garbage collection to clean up memory
    gc.collect()
    
    print("Model warmup complete and ready for inference")
    yield  # Application runs here
    
    # Shutdown code - currently no specific actions needed
    print("Shutting down application...")
    
# Initialize FastAPI app with lifespan
app = FastAPI(lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development. In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files directory
app.mount("/static", StaticFiles(directory="static"), name="static")

# Serve index.html as the root
@app.get("/")
async def read_index():
    return FileResponse("static/index.html")


def predict_new_img(filename, decision_threshold=0.5):
    """
    Makes predictions on a new image using the pre-loaded model.
    
    Args:
        filename (str): Path to the input image.
        decision_threshold (float): Threshold for class decision (default 0.5).
    
    Returns:
        dict: Contains prediction status, class and confidence, or error details.
    """
    # First attempt to load and preprocess the image
    preprocessed_img = load_prep_image(filename)
    if preprocessed_img is None:
        return {
            "success": False, 
            "error": "Image preprocessing failed"
        }

    try:
        # Make prediction
        model_pred_probs = session.run(None, {input_name: preprocessed_img})

        prob = model_pred_probs[0][0][0]
        
        # Determine class and confidence
        if prob > decision_threshold:
            pred_class = CLASS_NAMES[1]  # "AI"
            confidence = round(prob * 100, 2)
        else:
            pred_class = CLASS_NAMES[0]  # "Human"
            confidence = round((1 - prob) * 100, 2)
            
        return {
            "success": True,
            "class": pred_class,
            "confidence": confidence
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Prediction failed: {str(e)}"
        }

# Add this function before your endpoints
def create_error_response(status_code: int, message: str, details: str = None):
    """Creates a standardized error response"""
    response = {
        "status": "error",
        "code": status_code,
        "message": message
    }
    if details:
        response["details"] = details
    return JSONResponse(status_code=status_code, content=response)

# Update the predict endpoint with better error handling
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """Endpoint to upload an image and get a prediction."""
    
    # Validate file exists
    if not file or not file.filename:
        return create_error_response(400, "No file uploaded", 
                                    "Please select an image file to analyze")
        
    # Validate that the uploaded file is an image
    if not file.content_type.startswith("image/"):
        return create_error_response(400, "Invalid file type", 
                                    "Please upload a valid image file (JPG, PNG, etc.)")
    
    # Check file size (10MB limit)
    try:
        file_size = 0
        for chunk in file.file:
            file_size += len(chunk)
            if file_size > 10 * 1024 * 1024:  # 10MB
                return create_error_response(400, "File too large", 
                                           "Please upload an image smaller than 10MB")
        # Reset file position after reading
        await file.seek(0)
    except Exception as e:
        return create_error_response(500, "File processing error", str(e))

    # Save uploaded file temporarily
    temp_file_path = f"temp_{uuid.uuid4().hex}_{file.filename}"
    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        return create_error_response(500, "Failed to process uploaded file", str(e))

    # Make prediction with try-except for better error handling
    try:
        # Get the prediction result as a dictionary
        result = predict_new_img(temp_file_path)
        
        # Check if prediction was successful
        if not result["success"]:
            return create_error_response(422, "Image analysis failed", 
                                      result.get("error", "The model couldn't analyze this image"))
            
        # Successful prediction
        response = {
            "status": "success", 
            "class": result["class"], 
            "confidence": result["confidence"]
        }
        
    except Exception as e:
        response = create_error_response(500, "Prediction error", str(e))
    finally:
        # Clean up temporary file
        try:
            os.remove(temp_file_path)
        except Exception as e:
            print(f"Warning: Failed to delete temporary file {temp_file_path}: {e}")
    
    return response

# To run the app locally:
# uvicorn main:app --reload