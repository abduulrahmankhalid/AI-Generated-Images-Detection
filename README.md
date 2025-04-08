# AI-Generated Images Detection System

> This Repository is Part of the AWS Machine Learning Engineer Track on The Digital Egypt Pioneers Initiative (DEPI) Batch 2 - April 2025

## 📖 Project Report

### 📌 Introduction

With the rise of AI-generated media, distinguishing between **Human-Created and AI-Generated images** has become a significant challenge. This project presents an **AI-based image detection system** that classifies images as either **AI-generated or Human-Created** using advanced computer vision deep learning techniques. The system is built using **Python, TensorFlow, and Keras**, and is deployed on a robust AWS infrastructure. The backend is built with **FastAPI**, and the application is fully containerized with **Docker and Docker Compose**.

---

## 🎯 Objectives

- **Model Development**

  - Develop and compare state-of-the-art deep learning models for image classification including variants from the **EfficientNetV2** and **ConvNeXt** families.
  - Evaluate the models using a custom loss function that blends binary cross-entropy with a fairness-oriented MSE penalty to reduce bias and enforce a target prediction ratio.

- **Web Backend & Deployment**

  - Build a FastAPI backend to handle image uploads and inference requests.
  - Use **Docker and Docker Compose** to containerize the entire application.
  - Store models on **AWS S3**, push containers to **AWS ECR**, and run them on **AWS EC2**.
  - Automate deployments using **GitHub Actions** for CI/CD.

- **Data Pipeline and Augmentation**

  - Preprocess images at multiple resolutions (e.g., 224, 384).
  - Apply robust augmentation strategies like resizing, cropping, flipping, rotation, zooming, translation, and brightness adjustments to generalize the model.

- **Training and Model Selection**
  - Evaluate and compare several high-performance models, and deploy the best trade-off between accuracy and inference cost.

---

## 🔬 Methodology

### 1. Data Collection & Preprocessing

- **Dataset**:\
  The dataset is sourced from the [AI-Generated vs. Human-Created Images Competition Dataset](https://www.kaggle.com/competitions/detect-ai-vs-human-generated-images).

- **Preprocessing & Augmentation**:\
  Images are resized to resolutions like 224 or 384 and normalized using pretrained model-specific functions. Additional resizing (e.g., to 256 or 400) was tested during augmentation tuning. The augmentation pipeline uses Keras layers to apply transformations such as random cropping, flipping, rotation, translation, zoom, subtle blurring, and brightness shifts.

- **Data Splitting**:\
  The dataset is split into **90% training** and **10% validation**, with the Kaggle competition test set used for final testing.

### 2. Model Development & Training

We experimented with multiple high-performing models:

- **EfficientNetV2B2**

  - Validation Score: 94%
  - Kaggle Score: 73.5%

- **EfficientNetV2S**

  - Validation Score: 96%
  - Kaggle Score: 75.5%

- **ConvNeXtTiny**

  - Validation Score: 97%
  - Kaggle Score: 76.5%

While **ConvNeXtTiny** achieved the highest performance, **EfficientNetV2B2** was ultimately chosen for deployment due to its smaller size and faster inference—an essential trade-off for scalable, cloud-based deployment.

Our Kaggle competition score places us in the **Top 75 teams** from more than 550 teams, confirming the robustness of our approach and pipeline.

**Training Configuration**:

- **Optimizer**: AdamW
- **Loss Function**: Custom loss combining binary cross-entropy and an MSE fairness penalty.
  - **Explanation**: The MSE penalty enforces alignment with a target class distribution by penalizing deviation from a predefined ratio of AI-generated predictions, thereby mitigating bias and encouraging balanced predictions.
- **Evaluation Metrics**: Accuracy and F1-score
- **Training Duration**: 3–5 epochs

### 3. Web Backend & Deployment

- **Frontend**:\
  Developed using HTML, CSS, and JavaScript to create a clean, user-friendly interface.

- **Backend**:\
  Powered by **FastAPI**, the backend handles all image-upload routes and prediction requests efficiently.

- **Deployment Stack**:

  - **Docker & Docker Compose**: Used to containerize both the backend and frontend.
  - **AWS S3**: Stores trained model files.
  - **AWS ECR**: Hosts container images.
  - **AWS EC2**: Pulls and runs the latest containers and models from ECR and S3.
  - **GitHub Actions**: Automates building and pushing of containers to ECR, and triggers container updates on EC2.

---

## 📊 Summary

This project delivers a full-stack AI solution capable of classifying AI-generated vs. human-created images with high accuracy. From preprocessing and model design to containerized deployment on AWS, every layer was optimized for reliability, fairness, and scalability. The use of a custom bias-penalizing loss function and CI/CD with GitHub Actions makes the system both intelligent and production-ready.

> 🏆 Our competitive Kaggle score, which ranks us in the top 75 of over 550 teams, demonstrates the robustness and real-world applicability of our approach.

---
