document.getElementById('fileInput').addEventListener('change', handleFileSelect, false);
document.getElementById('saveButton').addEventListener('click', saveFiles, false);
document.getElementById('searchInput').addEventListener('input', filterFiles, false);
window.addEventListener('load', displaySavedFiles);

const storageKey = 'newSavedFiles'; // Nouvelle clé pour le stockage
let selectedFiles = [];

function handleFileSelect(event) {
    const files = event.target.files;
    selectedFiles = [];
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        selectedFiles.push(file);

        const listItem = document.createElement('div');
        listItem.className = 'file-item';
        listItem.textContent = file.name;
        fileList.appendChild(listItem);
    }
}

function saveFiles() {
    if (selectedFiles.length === 0) {
        alert('No files selected!');
        return;
    }

    selectedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(event) {
            const dataUrl = event.target.result;
            const files = JSON.parse(localStorage.getItem(storageKey)) || [];
            files.push({ name: file.name, dataUrl });
            localStorage.setItem(storageKey, JSON.stringify(files));
            displaySavedFiles();
        };
        reader.readAsDataURL(file);
    });
}

function displaySavedFiles() {
    const files = JSON.parse(localStorage.getItem(storageKey)) || [];
    const savedFilesList = document.getElementById('savedFilesList');
    savedFilesList.innerHTML = '';

    files.forEach((file, index) => {
        const listItem = document.createElement('div');
        listItem.className = 'file-item';

        const link = document.createElement('a');
        link.href = file.dataUrl;
        link.textContent = file.name;
        link.target = '_blank';
        
        const thumbnail = createThumbnail(file);
        const deleteButton = createDeleteButton(index);
        const previewButton = createPreviewButton(file.dataUrl);

        listItem.appendChild(thumbnail);
        listItem.appendChild(link);
        listItem.appendChild(previewButton);
        listItem.appendChild(deleteButton);
        savedFilesList.appendChild(listItem);
    });
}

function createThumbnail(file) {
    const thumbnail = document.createElement('div');
    thumbnail.className = 'thumbnail';

    if (file.name.endsWith('.pdf')) {
        const canvas = document.createElement('canvas');
        thumbnail.appendChild(canvas);
        showPDFThumbnail(file.dataUrl, canvas);
    } else if (file.name.match(/\.(jpeg|jpg|gif|png)$/)) {
        const img = document.createElement('img');
        img.src = file.dataUrl;
        thumbnail.appendChild(img);
    } else {
        thumbnail.textContent = 'No preview available';
    }

    return thumbnail;
}

function showPDFThumbnail(pdfUrl, canvas) {
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    loadingTask.promise.then(pdf => {
        pdf.getPage(1).then(page => {
            const scale = 0.5;
            const viewport = page.getViewport({ scale: scale });
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
                canvasContext: canvas.getContext('2d'),
                viewport: viewport
            };
            page.render(renderContext);
        });
    });
}

function createDeleteButton(index) {
    const button = document.createElement('button');
    button.textContent = 'Delete';
    button.className = 'delete-button';
    button.onclick = function() {
        const confirmed = confirm('Are you sure you want to delete this file?');
        if (confirmed) {
            deleteFile(index);
        }
    };
    return button;
}

function createPreviewButton(dataUrl) {
    const button = document.createElement('button');
    button.textContent = 'Preview';
    button.className = 'preview-button';
    button.onclick = function() {
        previewFile(dataUrl);
    };
    return button;
}

function deleteFile(index) {
    let files = JSON.parse(localStorage.getItem(storageKey)) || [];
    files.splice(index, 1);
    localStorage.setItem(storageKey, JSON.stringify(files));
    displaySavedFiles();
}

function filterFiles() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const files = JSON.parse(localStorage.getItem(storageKey)) || [];
    const filteredFiles = files.filter(file => file.name.toLowerCase().includes(searchTerm));
    displayFilteredFiles(filteredFiles);
}

function displayFilteredFiles(files) {
    const savedFilesList = document.getElementById('savedFilesList');
    savedFilesList.innerHTML = '';

    files.forEach((file, index) => {
        const listItem = document.createElement('div');
        listItem.className = 'file-item';

        const link = document.createElement('a');
        link.href = file.dataUrl;
        link.textContent = file.name;
        link.target = '_blank';
        
        const thumbnail = createThumbnail(file);
        const deleteButton = createDeleteButton(index);
        const previewButton = createPreviewButton(file.dataUrl);

        listItem.appendChild(thumbnail);
        listItem.appendChild(link);
        listItem.appendChild(previewButton);
        listItem.appendChild(deleteButton);
        savedFilesList.appendChild(listItem);
    });
}

function previewFile(dataUrl) {
    const previewContainer = document.getElementById('previewContainer');
    previewContainer.innerHTML = '';

    const loadingTask = pdfjsLib.getDocument(dataUrl);
    loadingTask.promise.then(pdf => {
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            pdf.getPage(pageNum).then(page => {
                const scale = 0.2;
                const viewport = page.getViewport({ scale });

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };

                page.render(renderContext).promise.then(() => {
                    previewContainer.appendChild(canvas);
                });
            });
        }
    });
}