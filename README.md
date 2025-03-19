# AI-Generated Image Detection System
>This Repository is Part of the AWS Machine Learning Engineer Track on The Digital Egpyt Pioneers Initiative (DEPI) Batch 2 - April 2025

## 📖 Project Report

### 📌 Introduction
With the rise of AI-generated media, distinguishing between **Human-Generated and AI-generated images** has become a significant challenge. This project presents an **AI-based image detection system** that can classify images as either **AI-generated or Human-Generated** using **deep learning techniques**. The system is built using **Python, TensorFlow, and Keras** and will be deployed on **AWS EC2**, with a **FastAPI backend and a web interface** for public access.

---

## 🎯 Objectives

- Develop a deep learning model capable of classifying AI-generated images.

- Build a FastAPI-based backend for handling user image uploads and inference requests.

- Create a web-based interface to allow easy interaction with the model.

- Deploy the entire system on AWS EC2 for scalability and public access.

---

## 🔬 Methodology
### **1️⃣ Data Collection & Preprocessing**
- **Dataset:** [AI vs. Human-Generated Images Competition Dataset](https://www.kaggle.com/competitions/detect-ai-vs-human-generated-images).
- **Preprocessing Steps:**
  - Resize images to **224x224 pixels**.
  - Normalize pixel values (0-1 range).
  - Apply **data augmentation** (flipping, rotation, brightness adjustments).
  - Split dataset into **train (70%)**, **validation (20%)**, and **test (10%)**.

### **2️⃣ Model Development & Training** (Current Phase)
- **Pretrained CNN Models Under Evaluation:**
  - **ResNet50**
  - **EfficientNetB0**
  - **MobileNetV2**
- **Training Parameters:**
  - Optimizer: **Adam**
  - Loss Function: **Binary Cross-Entropy**
  - Evaluation Metrics: **Accuracy, Precision, Recall, F1-score**
  - Training Duration: **10-15 epochs**
- **Model Selection Criteria:**
  - Accuracy on test dataset.
  - Inference speed and efficiency.
  - Robustness against adversarial AI-generated images.

### **3️⃣ Web Application Development** (Upcoming Phase)
- **Backend:** FastAPI to serve model predictions.
- **Frontend:** HTML, CSS, and JavaScript (Jinja2 templates for rendering pages).
- **Endpoints:**
  - **`/predict`** – Accepts an uploaded image and returns classification.
  - **`/health`** – Checks system health.

### **4️⃣ Deployment on AWS** (Final Phase)
- **EC2 Instance:** Hosts FastAPI backend and model inference.
- **Nginx:** Reverse proxy setup for handling web traffic.
- **Security Measures:**
  - HTTPS enabled for secure access.
  - Firewall rules configured for protection.

---

## 📊 Expected Results
- **Model Accuracy Goal:** Achieve at least **90%+ accuracy**.
- **Inference Speed Goal:** Ensure predictions run in **<0.2s per image**.
- **Scalability:** The final model should be lightweight enough for efficient cloud deployment.

---

## 🏆 Current Achievements
✅ Dataset preprocessed and ready for training.  
✅ Implemented augmentation techniques to improve model generalization.  
✅ Started training baseline models (ResNet50, EfficientNetB0, MobileNetV2).  

---

## 🚀 Next Steps
- 📌 Complete initial training runs and evaluate performance.
- 📌 Optimize hyperparameters and fine-tune models.
- 📌 Select the best model for deployment and integrate with FastAPI.

---

