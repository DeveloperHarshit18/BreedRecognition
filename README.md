# Cattle & Buffalo Breed Recognition

A responsive React frontend application for cattle and buffalo breed recognition using live camera feed and image capture functionality.

## Features

- **Live Camera Feed**: Real-time video stream using WebRTC getUserMedia API
- **Image Capture**: Capture frames from live video feed
- **Breed Recognition**: Display captured image with dummy confidence score
- **Image Download**: Save captured images as PNG files
- **Responsive Design**: Works on both desktop and mobile devices
- **Modern UI**: Clean, minimal design with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

## Usage

1. **Camera Access**: When you first load the page, allow camera permissions when prompted
2. **Capture Image**: Click the "Capture" button to take a photo from the live feed
3. **View Results**: The captured image will appear on the right side with recognition results
4. **Save Image**: Click "Save Image" to download the captured photo as a PNG file

## Technical Details

- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Camera**: WebRTC getUserMedia API
- **Image Processing**: HTML5 Canvas API
- **File Download**: Blob URL and anchor element

## Browser Compatibility

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

**Note**: Camera access requires HTTPS in production environments.

## Future Enhancements

- Integration with ML model for actual breed recognition
- Real-time confidence scoring
- Multiple breed detection
- Image preprocessing and enhancement
- Batch processing capabilities

