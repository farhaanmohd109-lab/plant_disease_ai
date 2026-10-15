/**
 * FloraScan AI - Plant Disease Detection System
 * Interactive Frontend JavaScript Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const dropZonePrompt = document.getElementById('drop-zone-prompt');
    const previewContainer = document.getElementById('preview-container');
    const imagePreview = document.getElementById('image-preview');
    const btnRemoveImg = document.getElementById('btn-remove-img');
    const predictionForm = document.getElementById('prediction-form');
    const btnSubmit = document.getElementById('btn-submit');
    const submitSpinner = document.getElementById('submit-spinner');
    const alertBox = document.getElementById('alert-box');
    const alertMessage = document.getElementById('alert-message');

    const emptyState = document.getElementById('empty-state');
    const resultContent = document.getElementById('result-content');

    const resSeverityBadge = document.getElementById('res-severity-badge');
    const resDiseaseName = document.getElementById('res-disease-name');
    const resConfidenceVal = document.getElementById('res-confidence-val');
    const resConfidenceText = document.getElementById('res-confidence-text');
    const resConfidenceFill = document.getElementById('res-confidence-fill');
    const resSymptoms = document.getElementById('res-symptoms');
    const resTreatment = document.getElementById('res-treatment');
    const resPrevention = document.getElementById('res-prevention');
    const resProbList = document.getElementById('res-prob-list');
    const resultTimestamp = document.getElementById('result-timestamp');

    // 1. Drag and Drop Handlers
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('dragover');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('dragover');
        });
    });

    dropZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            handleFileSelect(files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (fileInput.files.length > 0) {
            handleFileSelect(fileInput.files[0]);
        }
    });

    // 2. Handle Selected File & Client-Side Preview
    function handleFileSelect(file) {
        hideAlert();

        // Validate File Type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            showAlert('Please select a valid image file (JPG, PNG, or WEBP).');
            resetFileSelection();
            return;
        }

        // Validate File Size (16MB max)
        if (file.size > 16 * 1024 * 1024) {
            showAlert('File size exceeds maximum limit of 16MB.');
            resetFileSelection();
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            dropZonePrompt.classList.add('hidden');
            previewContainer.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }

    // 3. Reset File Selection
    btnRemoveImg.addEventListener('click', (e) => {
        e.stopPropagation();
        resetFileSelection();
    });

    function resetFileSelection() {
        fileInput.value = '';
        imagePreview.src = '#';
        previewContainer.classList.add('hidden');
        dropZonePrompt.classList.remove('hidden');
        hideAlert();
    }

    // 4. AJAX Form Submit Handler
    predictionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert();

        if (!fileInput.files || fileInput.files.length === 0) {
            showAlert('Please select a plant leaf image to analyze.');
            return;
        }

        const formData = new FormData(predictionForm);

        // UI Loading State
        btnSubmit.disabled = true;
        submitSpinner.classList.remove('hidden');

        try {
            const response = await fetch('/predict', {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to analyze image');
            }

            // Render Result Data
            displayResults(data);

        } catch (err) {
            showAlert(err.message || 'An error occurred during diagnosis.');
        } finally {
            btnSubmit.disabled = false;
            submitSpinner.classList.add('hidden');
        }
    });

    // 5. Render Diagnosis Output
    function displayResults(data) {
        emptyState.classList.add('hidden');
        resultContent.classList.remove('hidden');

        // Header Info - Separate Crop & Condition
        const resCropName = document.getElementById('res-crop-name');
        if (resCropName) {
            resCropName.textContent = data.crop || 'Vegetable';
        }
        resDiseaseName.textContent = data.condition || data.predicted_disease;
        resConfidenceVal.textContent = `${data.confidence}%`;
        resConfidenceText.textContent = `${data.confidence}%`;
        
        // Severity Badge Color
        resSeverityBadge.textContent = data.severity;
        resSeverityBadge.className = `severity-badge ${data.severity}`;

        // Animate Confidence Bar
        setTimeout(() => {
            resConfidenceFill.style.width = `${data.confidence}%`;
        }, 100);

        // Symptoms & Treatment
        resSymptoms.textContent = data.symptoms;
        resTreatment.textContent = data.treatment;
        resPrevention.textContent = data.prevention;

        // Timestamp
        const now = new Date();
        resultTimestamp.textContent = `Analyzed at ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;

        // Render Probabilities List
        resProbList.innerHTML = '';
        if (data.all_probabilities) {
            Object.entries(data.all_probabilities).forEach(([cls, prob]) => {
                const item = document.createElement('div');
                item.className = 'prob-item';
                item.innerHTML = `
                    <div class="prob-label-row">
                        <span>${cls}</span>
                        <span>${prob}%</span>
                    </div>
                    <div class="prob-track">
                        <div class="prob-fill" style="width: ${prob}%;"></div>
                    </div>
                `;
                resProbList.appendChild(item);
            });
        }
    }

    // 6. Utility Functions for Alerts
    function showAlert(msg) {
        alertMessage.textContent = msg;
        alertBox.classList.remove('hidden');
    }

    function hideAlert() {
        alertBox.classList.add('hidden');
    }
});
