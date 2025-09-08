import React, { useState, useRef, useEffect } from 'react'

function App() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [capturedImage, setCapturedImage] = useState(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [confidence, setConfidence] = useState(87) // Dummy confidence score
  const [cameraError, setCameraError] = useState(null)
  const [isCameraEnabled, setIsCameraEnabled] = useState(false) // Track if camera is enabled/disabled
  const [activeTab, setActiveTab] = useState('camera') // 'camera' or 'upload'
  const [uploadedImage, setUploadedImage] = useState(null)
  const fileInputRef = useRef(null)

  // Initialize camera
  useEffect(() => {
    let isMounted = true

    const initCamera = async () => {
      if (!isCameraEnabled) {
        return
      }
      
      try {
        setCameraError(null)
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 640, min: 320 },
            height: { ideal: 480, min: 240 },
            frameRate: { ideal: 30, max: 30 },
            facingMode: 'environment' // Default to back camera
          }
        })
        
        if (isMounted) {
          setStream(mediaStream)
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream
            
            // Wait for video to load before setting active
            videoRef.current.onloadedmetadata = () => {
              if (isMounted) {
                videoRef.current.play().then(() => {
                  setIsCameraActive(true)
                }).catch(err => {
                  console.error('Error playing video:', err)
                  setCameraError('Failed to start video playback')
                })
              }
            }
          }
        }
      } catch (error) {
        console.error('Error accessing camera:', error)
        if (isMounted) {
          setCameraError('Unable to access camera. Please ensure camera permissions are granted.')
        }
      }
    }

    initCamera()

    // Cleanup on unmount
    return () => {
      isMounted = false
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [isCameraEnabled])

  // Capture frame from video
  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext('2d')
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      // Draw current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Convert canvas to data URL
      const imageDataUrl = canvas.toDataURL('image/png')
      setCapturedImage(imageDataUrl)
      
      // Simulate processing delay and update confidence
      setTimeout(() => {
        setConfidence(Math.floor(Math.random() * 20) + 80) // Random confidence between 80-99%
      }, 500)
    }
  }

  // Save captured image
  const saveImage = () => {
    if (capturedImage) {
      const link = document.createElement('a')
      link.download = `cattle-breed-recognition-${Date.now()}.png`
      link.href = capturedImage
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  // Toggle camera enable/disable
  const toggleCamera = () => {
    if (isCameraEnabled) {
      // Disable camera
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      setStream(null)
      setIsCameraActive(false)
      setCameraError(null)
      setIsCameraEnabled(false)
    } else {
      // Enable camera
      setIsCameraEnabled(true)
    }
  }

  // Retry camera initialization
  const retryCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
    setStream(null)
    setIsCameraActive(false)
    setCameraError(null)
    
    // Reinitialize camera
    const initCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 640, min: 320 },
            height: { ideal: 480, min: 240 },
            frameRate: { ideal: 30, max: 30 },
            facingMode: 'environment'
          }
        })
        
        setStream(mediaStream)
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().then(() => {
              setIsCameraActive(true)
            }).catch(err => {
              console.error('Error playing video:', err)
              setCameraError('Failed to start video playback')
            })
          }
        }
      } catch (error) {
        console.error('Error accessing camera:', error)
        setCameraError('Unable to access camera. Please ensure camera permissions are granted.')
      }
    }
    
    initCamera()
  }


  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setUploadedImage(e.target.result)
          setCapturedImage(e.target.result) // Set as captured image for recognition
          setActiveTab('upload')
          
          // Simulate processing delay and update confidence
          setTimeout(() => {
            setConfidence(Math.floor(Math.random() * 20) + 80) // Random confidence between 80-99%
          }, 500)
        }
        reader.readAsDataURL(file)
      } else {
        alert('Please select a valid image file.')
      }
    }
  }

  // Trigger file input
  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  // Clear uploaded image
  const clearUploadedImage = () => {
    setUploadedImage(null)
    setCapturedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center py-4">
            <div className="mb-4 md:mb-0">
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                BREEDVISION
              </h1>
              <p className="text-sm text-gray-600">AI-Powered Breed Recognition</p>
            </div>
            
            {/* Navigation */}
            <nav className="flex space-x-1">
              <button
                onClick={() => setActiveTab('camera')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  activeTab === 'camera'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="hidden sm:inline">Live Camera</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  activeTab === 'upload'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="hidden sm:inline">Upload Image</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('about')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  activeTab === 'about'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="hidden sm:inline">About</span>
                </div>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {activeTab === 'about' ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">About Cattle Breed Recognition</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">Features</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start space-x-2">
                      <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Live camera feed with real-time capture</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Image upload from device</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Camera enable/disable functionality</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>AI-powered breed recognition</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Confidence scoring system</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">How to Use</h3>
                  <ol className="space-y-3 text-gray-600 list-decimal list-inside">
                    <li>Choose between Live Camera or Upload Image</li>
                    <li>For live camera: Allow camera permissions and capture photos</li>
                    <li>For upload: Select an image file from your device</li>
                    <li>View the recognition results with confidence score</li>
                    <li>Save the captured or uploaded image if needed</li>
                  </ol>
                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Supported Breeds</h4>
                    <p className="text-blue-700 text-sm">
                    Gir,Red Sindhi, Sahiwal, Kankrej, Tharparkar, Hallikar, Bargur, Red Baluchi ,Alambadi, Deoni and more.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Left Side - Camera/, */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-2 sm:space-y-0">
                <h2 className="text-xl font-semibold text-gray-700">
                  {activeTab === 'camera' ? 'Live Camera Feed' : 'Upload Image'}
                </h2>
                {activeTab === 'camera' && (
                  <div className="flex items-center justify-center sm:justify-end space-x-2">
                    <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-1">
                      <div className={`w-2 h-2 rounded-full ${isCameraEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm text-gray-600 font-medium">
                        {isCameraEnabled ? 'Camera Enabled' : 'Camera Disabled'}
                      </span>
                    </div>
                    <button
                      onClick={toggleCamera}
                      className={`${isCameraEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white font-semibold py-1 px-3 rounded-lg transition-colors duration-200 text-sm`}
                      title={isCameraEnabled ? 'Disable Camera' : 'Enable Camera'}
                    >
                      {isCameraEnabled ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                )}
              </div>
              <div className="relative">
                {activeTab === 'camera' ? (
                  <>
                    {isCameraEnabled ? (
                      <>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-64 md:h-80 lg:h-96 object-cover rounded-lg border-2 border-gray-200"
                          onError={(e) => {
                            console.error('Video error:', e)
                            setIsCameraActive(false)
                          }}
                          onLoadStart={() => {
                            console.log('Video loading started')
                          }}
                          onCanPlay={() => {
                            console.log('Video can play')
                            setIsCameraActive(true)
                          }}
                        />
                        {!isCameraActive && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-lg">
                            <div className="text-center">
                              {cameraError ? (
                                <div>
                                  <div className="text-red-500 mb-4">
                                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                  </div>
                                  <p className="text-red-600 mb-4">{cameraError}</p>
                                  <button
                                    onClick={retryCamera}
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                                  >
                                    Retry Camera
                                  </button>
                                </div>
                              ) : (
                                <div>
                                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                  <p className="text-gray-600">Loading camera...</p>
                                  <p className="text-sm text-gray-500 mt-2">Please allow camera access when prompted</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-64 md:h-80 lg:h-96 border-2 border-gray-200 rounded-lg flex items-center justify-center bg-gray-50">
                        <div className="text-center">
                          <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <p className="text-gray-500 mb-2">Camera is disabled</p>
                          <p className="text-sm text-gray-400">Click "Enable Camera" to start</p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-64 md:h-80 lg:h-96 border-2 border-gray-200 rounded-lg flex items-center justify-center bg-gray-50">
                    {uploadedImage ? (
                      <img
                        src={uploadedImage}
                        alt="Uploaded cattle/buffalo"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center">
                        <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-gray-500 mb-2">No image uploaded yet</p>
                        <p className="text-sm text-gray-400">Click "Upload Image" to select a file</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-4">
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  {activeTab === 'camera' ? (
                    <>
                      <button
                        onClick={toggleCamera}
                        className={`${isCameraEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200`}
                        title={isCameraEnabled ? 'Disable Camera' : 'Enable Camera'}
                      >
                        {isCameraEnabled ? 'Disable Camera' : 'Enable Camera'}
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={captureFrame}
                          disabled={!isCameraActive}
                          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex-1 sm:flex-none"
                        >
                          Capture
                        </button>
                        {isCameraEnabled && (
                          <button
                            onClick={captureFrame}
                            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex-1 sm:flex-none"
                          >
                            Retake
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={triggerFileUpload}
                        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 flex-1"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <span>Upload Image</span>
                        </div>
                      </button>
                      {uploadedImage && (
                        <button
                          onClick={clearUploadedImage}
                          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Right Side - Recognition Results */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">
                Recognition Results
              </h2>
            <div className="space-y-4">
              {/* Captured Image Display */}
              <div className="relative">
                {capturedImage ? (
                  <img
                    src={capturedImage}
                    alt="Captured cattle/buffalo"
                    className="w-full h-64 md:h-80 lg:h-96 object-cover rounded-lg border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-full h-64 md:h-80 lg:h-96 bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p>No image captured yet</p>
                      <p className="text-sm">Click "Capture" to take a photo</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Recognition Info */}
              {capturedImage && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Detected Breed
                      </label>
                      <p className="text-lg font-semibold text-gray-900">
                        Gir
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confidence Score
                      </label>
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${confidence}%` }}
                          ></div>
                        </div>
                        <span className="text-lg font-semibold text-gray-900">
                          {confidence}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              {capturedImage && (
                <div className="text-center">
                  <button
                    onClick={saveImage}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
                  >
                    Save Image
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 | All Rights Reserved</p>
        </div>
      </footer>

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}

export default App
