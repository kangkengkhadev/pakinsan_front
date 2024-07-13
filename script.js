const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
let drawing = false; 
const is_fill_bg = false;

if (is_fill_bg) {
    fill_background();
}

// Event listeners for mouse events
canvas.addEventListener('mousedown', (e) => { startDrawing(e); });
canvas.addEventListener('mouseup', () => { stopDrawing(); });
canvas.addEventListener('mousemove', (e) => { draw(e); });

// Event listeners for touch events
canvas.addEventListener('touchstart', (e) => { startDrawing(e.touches[0]); });
canvas.addEventListener('touchend', () => { stopDrawing(); });
canvas.addEventListener('touchmove', (e) => { draw(e.touches[0]); });

// Functions to handle drawing
function startDrawing(event) {
    drawing = true;
    draw(event); // Draw point on initial touch/mouse down
}

function stopDrawing() {
    drawing = false;
    ctx.beginPath();
}

function draw(event) {
    if (!drawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;

    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';

    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
}

function fill_background() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Clear canvas
document.getElementById('clearButton').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (is_fill_bg) fill_background();
    document.getElementById('previewImage').src = 'white.jpg';
    document.getElementById('result').innerText = ''; 
    document.getElementById('details').innerText = '';
    document.getElementById('previewImage2').src = 'white.jpg';
});

// Display image function
function display_image() {
    const myImage = canvas.toDataURL("image/jpg");
    document.getElementById('previewImage2').src = myImage;
}

document.getElementById('seecanvas').addEventListener('click', () => {
    display_image();
});

// Predict image function
async function predictImage(imageBlob) {
    const url = 'https://kangkengkhadev-test.hf.space/predict/';
    const formData = new FormData();
    formData.append('file', imageBlob);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Accept': 'application/json' },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
}

document.getElementById('predictButton').addEventListener('click', () => {
    canvas.toBlob(async (blob) => {
        const previewImage = document.getElementById('previewImage');
        const url = URL.createObjectURL(blob);

        previewImage.onload = () => {
            URL.revokeObjectURL(url);
        };

        previewImage.src = url;

        display_image();

        const result = await predictImage(blob);
        const predicted_class = result[0];
        const prob_healthy = result[1];
        const prob_pk = result[2];

        document.getElementById('result').innerText = `Prediction result: ${(predicted_class == 1) ? "Patient" : "Healthy"}`;
        document.getElementById('details').innerText = `Healthy: ${prob_healthy}\nPatient: ${prob_pk}`;

        if (predicted_class == 0) {
            document.getElementById("output_text").style.color = "green";
            const header_elem = document.getElementsByTagName('header');
            for (let elem of header_elem) {
                elem.style.backgroundColor = 'green';
            }
        } else {
            document.getElementById("output_text").style.color = 'red';
            const header_elem = document.getElementsByTagName('header');
            for (let elem of header_elem) {
                elem.style.backgroundColor = '#B31B1B';
            }
        }
    }, 'image/jpg');
});

document.getElementById('saveButton').addEventListener('click', () => {
    canvas.toBlob(async (blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'drawing.jpg'; // Set the download file name
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link); // Clean up
    }, 'image/jpg');
});
