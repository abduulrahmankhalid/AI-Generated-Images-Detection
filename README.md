# **AI-Generated Images Detection** <img src="https://github.com/user-attachments/assets/624e5c1a-8925-4945-8f10-66c656c1ffc3" alt="favicon" width="60"/> 

> This Repository is Part of the AWS Machine Learning Engineer Track on The Digital Egypt Pioneers Initiative (DEPI) Batch 2 - April 2025

## 📖 Project Report
### **[The System is live and accessible here:](http://ai-images-detection.tech/) [![Try the app](https://img.shields.io/badge/Try_the_Live_App-blue?style=for-the-badge)](http://ai-images-detection.tech/)**

## 🔍 Introduction

The line between real and AI-generated content is blurring fast. With tools like **DALL·E** and **Midjourney** now accessible to everyone, malicious use cases — from deepfake propaganda to fake historical imagery — are on the rise.

There’s a **critical need** for automated, scalable systems that can reliably detect such synthetic content. Manual verification doesn’t scale, and conventional tools fail to keep up with the realism of new AI models.

In this project, we aim to respond to that need by **developing a robust AI-powered image detection system** that classifies content as either **AI-generated** or **human-created**.

---

## 🎯 Objectives

- **Data Pipeline and Augmentation**

  - Preprocess images at multiple resolutions (e.g., 224, 384).
  - Apply robust augmentation strategies like resizing, cropping, flipping, rotation, zooming, shearing, and brightness-coloring adjustments to generalize the model.

- **Model Development**

  - Develop and compare state-of-the-art deep learning models for image classification, including variants from the **EfficientNetV2** and **ConvNeXt** families, deploy the best trade-off between accuracy and inference cost.
  - Evaluate the models using a custom loss function that blends binary cross-entropy with a fairness-oriented MSE penalty to reduce bias and enforce a target prediction ratio.
  - Converting the best-performing model to ONNX format for optimized deployment and faster inference in a production environment.

- **Web Backend & Deployment**

  - Build a FastAPI backend to handle image uploads and inference requests.
  - Use **Docker and Docker Compose** to containerize the entire application.
  - Store models on **AWS S3**, push containers to **AWS ECR**, and run them on **AWS EC2**.
  - Automate deployments using **GitHub Actions** for CI/CD.

---

## 🔬 Methodology

### 1️⃣ Data Collection & Preprocessing

- **Dataset**:
  The dataset is sourced from the [AI-Generated vs. Human-Created Images Competition](https://www.kaggle.com/competitions/detect-ai-vs-human-generated-images). The dataset for this Competition is provided by Shutterstock and DeepMedia, which combines authentic and AI-generated images to create a robust foundation for training and evaluation.

  > AI-Generated  Images Samples:
  
    >  ![AI-Images-Samples](https://github.com/user-attachments/assets/2291f1b2-7d73-450e-a1b1-b843e760380b)

  > Human-Created  Images Samples:
  
    >  ![Human-Images-Samples](https://github.com/user-attachments/assets/7fcbf796-4290-4dad-911a-dc07e84e9c14)

- **Preprocessing & Augmentation**:
  Images are resized to resolutions like 224 or 384 and normalized using pretrained model-specific functions. Additional resizing (e.g., to 256 or 400) was tested during augmentation tuning. The augmentation pipeline uses Keras layers to apply transformations such as random cropping, flipping, rotation, translation, zoom, subtle blurring, sharpness and brightness-colors shifts.
  

  >AI-Generated Augmented Images Samples:
  
    > ![AI-Generated-Augmented-Images](https://github.com/user-attachments/assets/3123b181-ca05-4842-b18b-dc47f48dc5b4)

  
  > Human-Created Augmented Images Samples:
  
    >  ![Human-Generated-Augmented-Images](https://github.com/user-attachments/assets/b99f557c-cf2f-4a17-9e29-86954f69dfa5)


- **Data Splitting**:

  The dataset is split into **90% training** (*about 72,000 Images*) and **10% validation** (*about 8,000 Images*), with the Kaggle competition test set (*about 5500 Images*) used for final testing.
  > Competition Test set Samples:
  
    > ![Test-Images](https://github.com/user-attachments/assets/a9ddc0d6-b0b8-429b-bc3e-48361a232ccb)
  
### 2️⃣ Model Development & Training

We experimented with multiple high-performing models:

- **EfficientNetV2B2**

  - Validation Score: 94%
  - Kaggle Score: 73.5%
  - Model Architecture:
    
      > ![EfficientNetV2B2_Model](https://github.com/user-attachments/assets/3afd4c26-7932-42b5-b4b3-71a6ef3f03d5)


- **EfficientNetV2S**

  - Validation Score: 96%
  - Kaggle Score: 75.5%
  - Model Architecture:

      > ![EfficientNetV2S_Model](https://github.com/user-attachments/assets/61c7f82a-61ff-4ae9-81bb-16fbbdd7215f)

- **ConvNeXtTiny**

  - Validation Score: 97%
  - Kaggle Score: 76.5%
  - Model Architecture:
    
      >![ConvNeXt_Model](https://github.com/user-attachments/assets/2c9abea7-0986-4613-a4b2-4c2e4c7c8bed)

While **ConvNeXtTiny** achieved the highest performance, **EfficientNetV2B2** was ultimately chosen for deployment due to its smaller size and faster inference—an essential trade-off for scalable, cloud-based deployment.

  > Comparing Models Accuracy and Scores:

   > ![Models_Comparison_Accuracy_Scores](https://github.com/user-attachments/assets/f9e7460b-7e51-4fcd-b9fb-bf5ee7ca8b8c)

  > Comparing Models Accuracy and Inference Time:

   > ![Models_Comparison_Size_Infrence](https://github.com/user-attachments/assets/13a612be-41c6-4c8e-a3d8-bc1b07737000)



*Our Kaggle competition score places us in the **Top 75 teams** from more than 550 teams, confirming the robustness of our approach and pipeline.*

**Training Configuration**:

- **Optimizer**: AdamW
- **Training Duration**: 3–5 epochs
- **Loss Function**: Custom loss to address models bias towards a particular class in training.
  - **Explanation**: We used a Custom loss combining binary cross-entropy and an MSE fairness penalty, which enforces alignment with a target class distribution by penalizing deviation from a predefined ratio of AI-generated predictions, thereby mitigating bias and encouraging balanced predictions.
    - **$Loss_1$**: Standard cross-entropy loss for training sample predictions.
    - **$Loss_2$**: Mean squared error (MSE) loss to enforce a target ratio $\beta$ of predicted class 1 (AI-generated) to class 0 (human-created) samples in the test set.
    
        > $$\text{MSE} = (\text{mean}(y_{\text{pred}}) - \beta)^2$$

    - The total loss is computed as:
        > $$\text{Total Loss} = \text{Loss}_1 + \alpha \times \text{Loss}_2$$
      
      where:
       - $\alpha$ is a hyperparameter controlling the weight of the fairness constraint.
       - $\beta$ is the target proportion of AI-generated images in predictions.

- **Evaluation Metrics**: Accuracy and F1-score
    > EfficientNetV2B2 Metrics:
      >![metrics](https://github.com/user-attachments/assets/b135f54c-a50a-4596-81bb-c8d7c497f2ae)
 

**Inference Configuration**:
- **ONNX Conversion**: The best model was converted to ONNX format for optimized deployment and faster inference.
- **Model Size Optimization**: The model was resized and optimized, reducing its file size to 35 MB.
- **Deployment-Ready**: These adjustments ensure efficient resource usage and faster execution in production environments.
- **Visualizing Some Models Prediction (from validation-set):**

  >![Visualizing-Predictions](https://github.com/user-attachments/assets/43d7972c-e6ba-4467-869e-7ae8ca65265e)


### 3️⃣ Web Backend & Deployment

- **Frontend**:\
  Developed using HTML, CSS, and JavaScript, the interface is clean, interactive, and user-friendly. Users can download the prediction for their images with the predicted class and confidence printed on it for their records. It also offers a dedicated history section where users can view all their past predictions they saved.
  >![Screenshot 2025-04-11 222207](https://github.com/user-attachments/assets/777f1510-e407-4467-bc19-e49cd819fe17)
  
  >![image](https://github.com/user-attachments/assets/7cac5c5f-a1a6-4cec-beee-213057a6b290)

  >![image](https://github.com/user-attachments/assets/d44eb1e2-27e4-4603-a688-567c77933477)

- **Backend**:\
  Powered by FastAPI, the backend handles all image-upload routes and prediction requests efficiently. It performs all required image preprocessing and model inference, and includes comprehensive error handling to ensure reliable operation in production. Additionally, it integrates with other AWS services for model storage and containerized deployment.

- **Deployment Stack**:

  - **Docker & Docker Compose**: Used to containerize both the backend and frontend.
  - **AWS S3**: Stores trained model files.
  - **AWS ECR**: Hosts container images.
  - **AWS EC2**: Pulls and runs the latest containers and models from ECR and S3.
  - **IAM Rules**: Employed to securely grant EC2, least-privilege access to S3, ECR.
  - **GitHub Actions**: Automates building and pushing of containers to ECR, triggering container updates on EC2.

- **System Architecture Design**:
  
    > ![System Design](https://github.com/user-attachments/assets/e2ca7e58-e6e6-4333-a970-077b6407c2d2)

### **[The System is always live and accessible here:](http://34.226.138.134/) [![EC2 Adress](https://img.shields.io/badge/AI_Images_Detection-yellow?style=plastic)](http://34.226.138.134/)**
---

## 📌 Summary

This project presents an end-to-end full-stack AI solution to classify AI-generated vs. human-created images using state-of-the-art deep learning models. Our pipeline includes robust data preprocessing and augmentation, training with a custom loss function that addresses model bias, and deployment using AWS services with containerized applications orchestrated via Docker Compose and updated via GitHub Actions.

*🏆 Our placement in the top 75 of more than 550 teams in Kaggle demonstrates that our approach is both robust and applicable in practical settings.*

---
