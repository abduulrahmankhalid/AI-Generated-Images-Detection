document.addEventListener('DOMContentLoaded', function() {
    // Initialize UI elements
    const elements = {
        uploadArea: document.getElementById('upload-area'),
        fileInput: document.getElementById('file-input'),
        predictButton: document.getElementById('predict-button'),
        predictionResult: document.getElementById('prediction-result'),
        historySection: document.getElementById('history-section'),
        historyContainer: document.getElementById('history-container'),
        clearHistoryBtn: document.getElementById('clear-history'),
        resultActions: document.getElementById('result-actions'),
        saveResultBtn: document.getElementById('save-result'),
        downloadResultBtn: document.getElementById('download-result'),
        shareResultBtn: document.getElementById('share-result'),
        homePreviewImage: document.getElementById('home-preview-image')
    };
    
    // App state
    const state = {
        selectedFile: null,
        currentPrediction: null,
        MAX_HISTORY_ITEMS: 4,
        savedItems: loadSavedItems()
    };
    
    // Initialize
    setupEventListeners();
    initializeHistory();
    createScanLines();
    
    /**
     * Load saved items from localStorage
     */
    function loadSavedItems() {
        return localStorage.getItem('savedPredictions') ? 
            JSON.parse(localStorage.getItem('savedPredictions')) : [];
    }
    
    /**
     * Set up all event listeners
     */
    function setupEventListeners() {
        // File upload
        elements.uploadArea.addEventListener('click', () => elements.fileInput.click());
        elements.uploadArea.addEventListener('dragover', handleDragOver);
        elements.uploadArea.addEventListener('dragleave', handleDragLeave);
        elements.uploadArea.addEventListener('drop', handleDrop);
        elements.fileInput.addEventListener('change', handleFileInputChange);
        
        // Action buttons
        elements.predictButton.addEventListener('click', handlePredictClick);
        elements.saveResultBtn.addEventListener('click', handleSaveResult);
        elements.downloadResultBtn.addEventListener('click', handleDownloadResult);
        elements.shareResultBtn.addEventListener('click', handleShareResult);
        elements.clearHistoryBtn.addEventListener('click', handleClearHistory);
    }
    
    /**
     * File input event handlers
     */
    function handleDragOver(e) {
        e.preventDefault();
        elements.uploadArea.classList.add('dragover');
    }
    
    function handleDragLeave() {
        elements.uploadArea.classList.remove('dragover');
    }
    
    function handleDrop(e) {
        e.preventDefault();
        elements.uploadArea.classList.remove('dragover');
        
        if (e.dataTransfer.files.length) {
            handleFile(e.dataTransfer.files[0]);
        }
    }
    
    function handleFileInputChange(e) {
        if (e.target.files.length) {
            handleFile(e.target.files[0]);
        }
    }
    
    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }
        
        state.selectedFile = file;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            elements.homePreviewImage.src = e.target.result;
            elements.homePreviewImage.alt = "Uploaded Image";
            elements.predictButton.disabled = false;
        };
        reader.readAsDataURL(file);
    }
    
    /**
     * Prediction and result handling
     */
    function handlePredictClick() {
        if (!state.selectedFile) return;
        
        // Show animated loading state
        elements.predictionResult.innerHTML = `
            <div class="loading">
                <div class="scan-box">
                    <div class="scan-line-horizontal"></div>
                    <div class="scan-line-vertical"></div>
                </div>
                Analyzing image<span class="loading-dots"></span>
            </div>`;
        elements.predictionResult.classList.remove('hidden-result');
        elements.predictButton.disabled = true;
        elements.resultActions.classList.add('hidden');
        
        // Create form data for API request
        const formData = new FormData();
        formData.append("file", state.selectedFile);
        
        fetch('/predict', {
            method: 'POST',
            body: formData,
        })
        .then(response => {
            // Parse JSON regardless of success/failure
            return response.json().then(data => {
                // Add status code to the parsed data
                data.statusCode = response.status;
                
                // If response wasn't ok, treat as error even with valid JSON
                if (!response.ok) {
                    throw data;
                }
                return data;
            });
        })
        .then(data => {
            // Process the successful API response
            state.currentPrediction = {
                file: state.selectedFile,
                isAI: data.class === "AI",
                confidence: data.confidence,
                timestamp: new Date().toISOString()
            };
            
            displayPredictionResult(state.currentPrediction);
        })
        .catch(error => {
            console.error('Error:', error);
            
            // Handle structured API errors
            if (error && error.message) {
                // Use the error information from the API
                elements.predictionResult.innerHTML = `
                    <div class="error">
                        <h3>${error.message || 'Error'}</h3>
                        <p>${error.details || 'An error occurred while analyzing the image.'}</p>
                        <button class="secondary-button retry-button">
                            <i class="fas fa-redo"></i> Try Again
                        </button>
                    </div>
                `;
            } else {
                // Generic network errors
                elements.predictionResult.innerHTML = `
                    <div class="error">
                        <h3>Connection Error</h3>
                        <p>Unable to connect to the server. Please check your internet connection and try again.</p>
                        <button class="secondary-button retry-button">
                            <i class="fas fa-redo"></i> Try Again
                        </button>
                    </div>
                `;
            }
            
            // Add event listener to retry button
            const retryButton = elements.predictionResult.querySelector('.retry-button');
            if (retryButton) {
                retryButton.addEventListener('click', handlePredictClick);
            }
            
            elements.predictButton.disabled = false;
        });
    }
    
    /**
     * Get detailed explanation based on confidence level and classification
     * @param {number} confidence - Prediction confidence percentage
     * @param {boolean} isAI - Whether the image is classified as AI-generated
     * @returns {string} - Explanatory statement about image characteristics
     */
    function getConfidenceStatement(confidence, isAI) {
        if (isAI) {
            // AI-generated image explanations
            if (confidence >= 98) {
                return "Showing clear digital artifacts and unnatural patterns typical of AI generation.";
            } else if (confidence >= 93) {
                return "Exhibiting inconsistent textures and unnaturally perfect details characteristic of AI tools.";
            } else if (confidence >= 87) {
                return "Displaying subtle symmetry and pixel patterns consistent with AI generation.";
            } else if (confidence >= 80) {
                return "Showing some unnatural element arrangements typical of AI rendering.";
            } else if (confidence >= 70) {
                return "Containing certain artificial patterns that suggest AI involvement.";
            } else {
                return "Showing some characteristics that might indicate AI processing.";
            }
        } else {
            // Human-created image explanations
            if (confidence >= 98) {
                return "Displaying natural imperfections and authentic details typical in human photography.";
            } else if (confidence >= 93) {
                return "Showing realistic lighting conditions and natural perspective consistent with human creation.";
            } else if (confidence >= 87) {
                return "Exhibiting organic composition and natural element arrangement.";
            } else if (confidence >= 80) {
                return "Displaying natural textures and lighting typical of human photography.";
            } else if (confidence >= 70) {
                return "Containing authentic elements that suggest human creation.";
            } else {
                return "Showing some characteristics that suggest human involvement.";
            }
        }
    }

    // Update the displayPredictionResult function
    function displayPredictionResult(prediction) {
        const resultClass = prediction.isAI ? 'ai' : 'human';
        const confidenceStatement = getConfidenceStatement(prediction.confidence, prediction.isAI);
        const certaintyLevel = getCertaintyLevel(prediction.confidence);
        
        // Create the initial HTML including certainty level
        elements.predictionResult.innerHTML = `
            <div class="result ${resultClass}">
                <h3>Prediction Result</h3>
                <p class="prediction ${resultClass}">This image is ${certaintyLevel} <strong>${prediction.isAI ? 'AI-GENERATED' : 'HUMAN-CREATED'}</strong>,</p>
                <p class="explanation ${resultClass}"></p>
                <div class="confidence-bar-container">
                    <div class="confidence-bar"></div>
                    <span class="confidence-label"></span>
                </div>
            </div>
        `;
        
        // Get elements for animation
        const explanationElement = elements.predictionResult.querySelector('.explanation');
        const confidenceLabel = elements.predictionResult.querySelector('.confidence-label');
        
        // Show the action buttons
        elements.resultActions.classList.remove('hidden');
        
        // Animate the confidence bar
        setTimeout(() => {
            const confidenceBar = document.querySelector('.confidence-bar');
            if (confidenceBar) {
                confidenceBar.style.width = `${prediction.confidence}%`;
                
                // Start typing animations after bar animation begins
                setTimeout(() => {
                    // Animate the explanation text
                    typeTextAnimation(explanationElement, confidenceStatement, 25);
                    
                    // After explanation is done, animate the confidence percentage
                    setTimeout(() => {
                        typeTextAnimation(confidenceLabel, `${prediction.confidence}% confidence`, 40);
                    }, confidenceStatement.length * 25 + 200);
                }, 300);
            }
        }, 100);
        
        elements.predictButton.disabled = false;
    }

    /**
     * Get certainty level based on confidence percentage
     * @param {number} confidence - Prediction confidence percentage
     * @returns {string} - Certainty level statement
     */
    function getCertaintyLevel(confidence) {
        if (confidence >= 98) {
            return "almost certainly";
        } else if (confidence >= 93) {
            return "with high certainty";
        } else if (confidence >= 85) {
            return "highly likely";
        } else if (confidence >= 75) {
            return "likely";
        } else if (confidence >= 65) {
            return "moderately likely";
        } else {
            return "possibly";
        }
    }

    /**
     * Save, download and share handlers
     */
    function handleSaveResult() {
        if (!state.currentPrediction) return;
        
        processImageWithResult(state.currentPrediction, (processedImageUrl) => {
            // Save both original and processed images to history
            const savedPrediction = {
                imgData: processedImageUrl,
                isAI: state.currentPrediction.isAI,
                confidence: state.currentPrediction.confidence,
                timestamp: state.currentPrediction.timestamp,
                originalBlob: state.currentPrediction.file
            };
            
            // Update history
            state.savedItems.unshift(savedPrediction);
            
            // Keep only MAX_HISTORY_ITEMS
            if (state.savedItems.length > state.MAX_HISTORY_ITEMS) {
                state.savedItems = state.savedItems.slice(0, state.MAX_HISTORY_ITEMS);
            }
            
            // Save to localStorage (excluding blobs)
            const storageItems = state.savedItems.map(item => {
                const { originalBlob, ...storableItem } = item;
                return storableItem;
            });
            localStorage.setItem('savedPredictions', JSON.stringify(storageItems));
            
            // Update UI
            updateHistoryUI();
            elements.historySection.classList.remove('hidden');
        });
    }
    
    function handleDownloadResult() {
        if (!state.currentPrediction) return;
        
        processImageWithResult(state.currentPrediction, (dataUrl) => {
            const link = document.createElement('a');
            link.download = 'ai-analysis-result.jpg';
            link.href = dataUrl;
            link.click();
        });
    }
    
    function handleShareResult() {
        if (!state.currentPrediction || !navigator.share) {
            alert('Sharing is not supported in your browser');
            return;
        }
        
        try {
            shareResult();
        } catch (error) {
            console.error('Error sharing:', error);
            alert('Unable to share: ' + error.message);
        }
    }
    
    async function shareResult() {
        const blob = await (await fetch(URL.createObjectURL(state.currentPrediction.file))).blob();
        const file = new File([blob], 'ai-analysis.jpg', { type: 'image/jpeg' });
        
        await navigator.share({
            title: 'AI Image Analysis Result',
            text: `This image is ${state.currentPrediction.isAI ? 'AI-generated' : 'human-created'} with ${state.currentPrediction.confidence}% confidence.`,
            files: [file]
        });
    }
    
    function handleClearHistory() {
        state.savedItems = [];
        localStorage.removeItem('savedPredictions');
        elements.historyContainer.innerHTML = '';
        elements.historySection.classList.add('hidden');
    }
    
    /**
     * Image processing
     */
    function processImageWithResult(prediction, callback) {
        const canvas = document.createElement('canvas');
        const img = new Image();
        
        img.onload = function() {
            // Set canvas dimensions
            canvas.width = img.width;
            canvas.height = img.height;
            
            const ctx = canvas.getContext('2d');
            
            // Draw the image
            ctx.drawImage(img, 0, 0);
            
            // Calculate overlay dimensions
            const overlayHeight = calculateResponsiveOverlayHeight(img.height);
            const fontSize = calculateFontSize(overlayHeight, canvas.width);
            const borderHeight = Math.max(3, Math.floor(overlayHeight * 0.08));
            
            // Draw overlay background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            ctx.fillRect(0, canvas.height - overlayHeight, canvas.width, overlayHeight);
            
            // Draw colored border
            const borderColor = prediction.isAI ? '#ff4757' : '#2ed573';
            ctx.fillStyle = borderColor;
            ctx.fillRect(0, canvas.height - overlayHeight - borderHeight, canvas.width, borderHeight);
            
            // Draw text
            drawOverlayText(ctx, prediction, canvas.width, canvas.height, overlayHeight, fontSize);
            
            // Return processed image
            const processedImageUrl = canvas.toDataURL('image/jpeg', 0.95);
            callback(processedImageUrl);
        };
        
        img.src = URL.createObjectURL(prediction.file);
    }
    
    function calculateResponsiveOverlayHeight(imageHeight) {
        const minOverlayHeight = 40;
        const maxOverlayHeight = 100;
        let overlayHeight = Math.floor(imageHeight * 0.08);
        return Math.max(minOverlayHeight, Math.min(overlayHeight, maxOverlayHeight));
    }
    
    function calculateFontSize(overlayHeight, canvasWidth) {
        const baseFontSize = Math.max(14, Math.min(24, overlayHeight * 0.5));
        return Math.min(baseFontSize, canvasWidth * 0.04);
    }
    
    function drawOverlayText(ctx, prediction, width, height, overlayHeight, fontSize) {
        // Configure text style
        ctx.font = `bold ${fontSize}px Inter, sans-serif`;
        ctx.fillStyle = prediction.isAI ? '#ff4757' : '#2ed573';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Position text
        const textY = height - (overlayHeight / 2);
        
        // Create text
        const resultText = `${prediction.isAI ? 'AI-GENERATED' : 'HUMAN-CREATED'} (${prediction.confidence}% confidence)`;
        
        // Adjust font size if text is too wide
        if (ctx.measureText(resultText).width > width * 0.9) {
            const reducedSize = fontSize * (width * 0.9 / ctx.measureText(resultText).width);
            ctx.font = `bold ${reducedSize}px Inter, sans-serif`;
        }
        
        // Draw text
        ctx.fillText(resultText, width / 2, textY);
    }
    
    /**
     * History handling
     */
    function initializeHistory() {
        if (state.savedItems.length > 0) {
            // Reset blob references lost during storage
            state.savedItems = state.savedItems.map(item => ({
                ...item,
                originalBlob: null
            }));
            
            updateHistoryUI();
            elements.historySection.classList.remove('hidden');
        }
    }
    
    function updateHistoryUI() {
        elements.historyContainer.innerHTML = '';
        
        state.savedItems.forEach((item) => {
            const historyItemElement = createHistoryItemElement(item);
            elements.historyContainer.appendChild(historyItemElement);
        });
    }
    
    function createHistoryItemElement(item) {
        const resultClass = item.isAI ? 'ai' : 'human';
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        historyItem.innerHTML = `
            <img src="${item.imgData}" alt="History image">
            <div class="history-item-details">
                <p class="prediction ${resultClass}">
                    ${item.isAI ? 'AI-Generated' : 'Human-Created'}
                </p>
                <p class="confidence">Confidence: ${item.confidence}%</p>
            </div>
        `;
        
        historyItem.addEventListener('click', () => {
            displayHistoryItem(item);
        });
        
        return historyItem;
    }
    
    // Also update displayHistoryItem function the same way
    function displayHistoryItem(item) {
        // Scroll back to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Display the image
        elements.homePreviewImage.src = item.imgData;
        elements.homePreviewImage.alt = "Previous Result";
        
        // Get appropriate statements
        const confidenceStatement = getConfidenceStatement(item.confidence, item.isAI);
        const certaintyLevel = getCertaintyLevel(item.confidence);
        const resultClass = item.isAI ? 'ai' : 'human';
        
        // Show prediction result with certainty level
        elements.predictionResult.innerHTML = `
            <div class="result ${resultClass}">
                <h3>Previous Prediction Result</h3>
                <p class="prediction ${resultClass}">This image is ${certaintyLevel} <strong>${item.isAI ? 'AI-GENERATED' : 'HUMAN-CREATED'}</strong>,</p>
                <p class="explanation ${resultClass}"></p>
                <div class="confidence-bar-container">
                    <div class="confidence-bar" style="width: 0%"></div>
                    <span class="confidence-label"></span>
                </div>
            </div>
        `;
        
        // Get elements for animation
        const explanationElement = elements.predictionResult.querySelector('.explanation');
        const confidenceBar = document.querySelector('.confidence-bar');
        const confidenceLabel = document.querySelector('.confidence-bar-container .confidence-label');
        
        // Show UI elements
        elements.predictionResult.classList.remove('hidden-result');
        elements.resultActions.classList.remove('hidden');
        
        // Rest of the animation code remains the same
        setTimeout(() => {
            if (confidenceBar) {
                confidenceBar.style.width = `${item.confidence}%`;
                
                setTimeout(() => {
                    typeTextAnimation(explanationElement, confidenceStatement, 25);
                    
                    setTimeout(() => {
                        typeTextAnimation(confidenceLabel, `${item.confidence}% confidence`, 40);
                    }, confidenceStatement.length * 25 + 200);
                }, 300);
            }
        }, 100);
        
        // Set up for download
        createDownloadableImageFromHistory(item);
    }
    
    function createDownloadableImageFromHistory(historyItem) {
        if (historyItem.originalBlob) {
            // Use existing blob if available
            state.currentPrediction = {
                file: historyItem.originalBlob,
                isAI: historyItem.isAI,
                confidence: historyItem.confidence,
                timestamp: historyItem.timestamp
            };
            
            enableActionButtons();
            return;
        }
        
        // Extract original image from history image
        extractOriginalImageFromHistory(historyItem);
    }
    
    function extractOriginalImageFromHistory(historyItem) {
        const img = new Image();
        
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Calculate overlay height to remove from bottom
            const overlayHeight = calculateResponsiveOverlayHeight(img.height);
            const borderHeight = Math.max(3, Math.floor(overlayHeight * 0.08));
            const visibleHeight = img.height - overlayHeight - borderHeight;
            
            // Draw only the portion without overlay
            ctx.drawImage(
                img, 
                0, 0, img.width, visibleHeight,
                0, 0, canvas.width, visibleHeight
            );
            
            // Create new image
            canvas.toBlob(function(blob) {
                state.currentPrediction = {
                    file: new File([blob], 'original-image.jpg', { type: 'image/jpeg' }),
                    isAI: historyItem.isAI,
                    confidence: historyItem.confidence,
                    timestamp: historyItem.timestamp
                };
                
                enableActionButtons();
            }, 'image/jpeg', 0.95);
        };
        
        img.src = historyItem.imgData;
    }
    
    function enableActionButtons() {
        elements.downloadResultBtn.disabled = false;
        elements.shareResultBtn.disabled = false;
    }
    
    /**
     * Create animated scanning lines
     */
    function createScanLines() {
        // Remove old lines
        document.querySelectorAll('.scan-line').forEach(line => line.remove());
        
        // Create new lines
        for (let i = 0; i < 3; i++) {
            const scanLine = document.createElement('div');
            scanLine.className = 'scan-line';
            scanLine.style.animationDelay = `${i * 2.5}s`;
            document.body.appendChild(scanLine);
        }
        
        // Recreate lines periodically
        setTimeout(createScanLines, 8000);
    }

    /**
     * Creates typing animation effect for text
     * @param {HTMLElement} element - Element to apply typing animation to
     * @param {string} text - Full text to type
     * @param {number} speed - Typing speed in milliseconds per character
     */
    function typeTextAnimation(element, text, speed = 30) {
        let currentText = "";
        let index = 0;
        
        // Clear existing content
        element.textContent = "";
        
        // Type one character at a time
        const typingInterval = setInterval(() => {
            if (index < text.length) {
                currentText += text.charAt(index);
                element.textContent = currentText;
                index++;
            } else {
                clearInterval(typingInterval);
            }
        }, speed);
    }
});