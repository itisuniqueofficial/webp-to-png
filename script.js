let originalImage = null;
let fileName = '';
const imageInput = document.getElementById('imageInput');
const previewImage = document.getElementById('previewImage');
const convertButton = document.getElementById('convertButton');
const clearButton = document.getElementById('clearButton');
const resultSection = document.getElementById('resultSection');
const resultInfo = document.getElementById('resultInfo');
const downloadLink = document.getElementById('downloadLink');

imageInput.addEventListener('change', handleImageUpload);

document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
        const faqItem = button.parentElement;
        const isActive = faqItem.classList.contains('active');
        
        document.querySelectorAll('.faq-item').forEach(item => {
            if (item !== faqItem) item.classList.remove('active');
            item.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        });
        
        faqItem.classList.toggle('active');
        button.setAttribute('aria-expanded', !isActive);
        
        const answer = faqItem.querySelector('.faq-answer');
        if (faqItem.classList.contains('active')) {
            answer.style.maxHeight = answer.scrollHeight + 'px';
        } else {
            answer.style.maxHeight = '0';
        }
    });
});

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file || !file.type.match('image/webp')) {
        alert('Please upload a valid WebP image!');
        imageInput.value = '';
        previewImage.style.display = 'none';
        return;
    }

    fileName = file.name.split('.').slice(0, -1).join('.');
    const reader = new FileReader();
    reader.onload = function(e) {
        originalImage = new Image();
        originalImage.onload = function() {
            previewImage.src = e.target.result;
            previewImage.style.display = 'block';
            convertButton.disabled = false;
            resultSection.classList.remove('visible');
        };
        originalImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

async function convertImage() {
    if (!originalImage) {
        alert('Please upload a WebP image first!');
        return;
    }

    convertButton.disabled = true;
    convertButton.textContent = 'Converting...';

    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = originalImage.width;
        canvas.height = originalImage.height;
        ctx.drawImage(originalImage, 0, 0);

        const convertedDataUrl = await new Promise(resolve => {
            canvas.toBlob(blob => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            }, 'image/png');
        });

        const byteString = atob(convertedDataUrl.split(',')[1]);
        const fileSize = (byteString.length / 1024).toFixed(2);

        resultInfo.textContent = `Converted to PNG | Size: ${fileSize} KB | Dimensions: ${originalImage.width}x${originalImage.height}px`;
        downloadLink.href = convertedDataUrl;
        downloadLink.download = `${fileName}-converted.png`;
        resultSection.classList.add('visible');
    } catch (error) {
        alert('Error converting image: ' + error.message);
    } finally {
        convertButton.disabled = false;
        convertButton.textContent = 'Convert to PNG';
    }
}

function clearForm() {
    imageInput.value = '';
    previewImage.src = '';
    previewImage.style.display = 'none';
    originalImage = null;
    convertButton.disabled = true;
    resultSection.classList.remove('visible');
}