# **AI-Generated Images Detection** <img src="https://github.com/user-attachments/assets/624e5c1a-8925-4945-8f10-66c656c1ffc3" alt="favicon" width="60"/> 

> This Repository is Part of the AWS Machine Learning Engineer Track on The Digital Egypt Pioneers Initiative (DEPI) Batch 2 - April 2025

## 📖 Project Report
### **[The System is live and accessible here:](http://ai-images-detection.tech/) [![Try the app](https://img.shields.io/badge/Try_the_Live_App-blue?style=for-the-badge)](http://ai-images-detection.tech/)**

## 🔍 Introduction

- The line between real and AI-generated content is blurring fast. With tools like **DALL·E** and **Midjourney** now accessible to everyone, malicious use cases — from deepfake propaganda to fake historical imagery — are on the rise.

- There’s a **critical need** for automated, scalable systems that can reliably detect such synthetic content. Manual verification doesn’t scale, and conventional tools fail to keep up with the realism of new AI models.

- In this project, we aim to respond to that need by **developing a robust AI-powered image detection system** that classifies content as either **AI-generated** or **human-created**.

---

## 🎯 Objectives

- **Data Pipeline and Augmentation**

  - Preprocess images at multiple resolutions (e.g., 224, 384).
  - Apply robust augmentation strategies like resizing, cropping, flipping, rotation, zooming, shearing, and brightness-coloring adjustments to generalize the model.

- **Model Development**

  - Develop and compare state-of-the-art deep learning models for image classification, including variants from the **EfficientNet** and **ConvNeXt** families, deploy the best trade-off between accuracy and inference cost.
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
  Images are resized to resolutions like 224 or 384 and normalized using pretrained model-specific functions. The augmentation pipeline uses Keras layers to apply transformations such as random cropping, flipping, rotation, translation, zoom, subtle blurring, sharpness and brightness-colors shifts.
  

  >AI-Generated Augmented Images Samples:
  
    > ![AI-Generated-Augmented-Images](https://github.com/user-attachments/assets/3123b181-ca05-4842-b18b-dc47f48dc5b4)

  
  > Human-Created Augmented Images Samples:
  
    >  ![Human-Generated-Augmented-Images](https://github.com/user-attachments/assets/b99f557c-cf2f-4a17-9e29-86954f69dfa5)


- **Data Splitting**:

  The dataset is split into **90% training** (*about 72,000 Images*) and **10% validation** (*about 8,000 Images*), with the Kaggle competition test set (*about 5500 Images*) used for final testing.
  > Competition Test Set Samples:
  
    > ![Test-Images](https://github.com/user-attachments/assets/a9ddc0d6-b0b8-429b-bc3e-48361a232ccb)
  
### 2️⃣ Model Development & Training

We experimented with multiple high-performing models:

- **EfficientNetV2S**

  - Validation Score: 98%
  - Kaggle Score: 77.5%
  - Model Architecture:
    - Native version from Keras Pre-trained models.
      > ![EfficientNetV2S_Model](https://github.com/user-attachments/assets/02cd90e1-d745-4150-bf5d-07b0f72fde70)


- **ConvNeXtTiny**

  - Validation Score: 99%
  - Kaggle Score: 79%
  - Model Architecture:
    - Native version from Keras Pre-trained models.
      > ![ConvNeXt_Model](https://github.com/user-attachments/assets/80583a04-04d6-466b-a858-cec70b542c75)


- **EfficientNetB5-Swin**

  - Validation Score: 99%
  - Kaggle Score: 81%
  - Model Architecture:
    - Keras Hub EfficientNet B5 model pre-trained on the ImageNet 12k dataset and fine-tuned on ImageNet-1k by Ross Wightman. Based on Swin Transformer train / pretrain recipe with modifications (related to both DeiT and ConvNeXt recipes).
      >![EfficientNetB5Swin_Model](https://github.com/user-attachments/assets/8f6450f5-f847-4170-a4ca-9d91743258ec)


**EfficientNetB5-Swin** was ultimately chosen for deployment due to its superior performance and efficient trade-off between accuracy, size, and inference speed—an essential trade-off for scalable, cloud-based deployment.

  > Comparing Models' Accuracy and Scores:

   > ![Models_Comparison_Accuracy_Scores](https://github.com/user-attachments/assets/759db816-506a-4167-b336-5fce00748ef6)


  > Comparing Models' Accuracy and Inference Time:

   > ![Models_Comparison_Size_Infrence](https://github.com/user-attachments/assets/b06ad065-534f-453d-a2ed-821621f8cfab)



*Our Kaggle competition score would place us in the **Top 20 teams** from more than 550 teams, confirming the robustness of our approach and pipeline.*

**Training Configuration**:

- **Optimizer**: AdamW
- **Training Duration**: 3–5 epochs
- **Loss Function**: Custom loss to address models' bias towards a particular class in training.
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
    > EfficientNetB5-Swin Metrics:
      >![metrics](https://github.com/user-attachments/assets/f8cde569-8bde-4ddc-8a2a-127028b68d05)

 

**Inference Configuration**:
- **ONNX Conversion**: The best model was converted to ONNX format for optimized deployment and faster inference.
- **Model Size Optimization**: The model was resized and optimized, reducing its file size to 115 MB.
- **Deployment-Ready**: These adjustments ensure efficient resource usage and faster execution in production environments.
- **Visualizing Some Models' Prediction (from validation-set):**

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

## 🔮 Future Work & Limitations

### 🚧 Limitations

- **Data & Domain Drift**:  
  The model may underperform in production as generative models evolve rapidly, causing a **drift between the training data and newly generated images**.

- **Static Model**:  
  Without updates, the model risks becoming outdated, especially as image realism from AI tools continues to improve.

- **Lack of Interpretability**:  
  Currently, predictions are made as black-box outputs, with no real built-in explainability for users or developers.

> Sample from wrong predictions:

  >![image](https://github.com/user-attachments/assets/a67c2a36-b3fb-4205-bf46-12e6a4fcf059)
 
### 🔄 Future Work

- **Continuous Retraining**:  
  Develop pipelines to frequently retrain the model with the latest AI-generated image data to keep pace with generative trends.

- **User Feedback Loop**:  
  Incorporate misclassified samples into the training set to enhance the system's robustness over time.

- **Explainable AI Integration**:  
  Add tools like Grad-CAM to help visualize model decisions and improve trust in predictions.

---

## 📌 Summary

This project presents an end-to-end full-stack AI solution to classify AI-generated vs. human-created images using state-of-the-art deep learning models. Our pipeline includes robust data preprocessing and augmentation, training with a custom loss function that addresses model bias, and deployment using AWS services with containerized applications orchestrated via Docker Compose and updated via GitHub Actions.

*🏆 Our score placement in the top 20 of more than 550 teams in Kaggle demonstrates that our approach is both robust and applicable in practical settings.*

---
