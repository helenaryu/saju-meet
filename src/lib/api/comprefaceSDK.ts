import { CompreFace } from '@exadel/compreface-js-sdk';

// CompreFace configuration
const baseUrl = process.env.NEXT_PUBLIC_COMPREFACE_URL || 'http://localhost:8000';
const apiKey = process.env.NEXT_PUBLIC_COMPREFACE_API_KEY || '00000000-0000-0000-0000-000000000003';

// Initialize CompreFace SDK
export const comprefaceSDK = new CompreFace(baseUrl, 8000);

// Initialize detection service
export const detectionService = comprefaceSDK.initFaceDetectionService(apiKey);

// Helper function to detect faces using direct HTTP API (more reliable)
export async function detectFacesWithSDK(imageFile: File) {
  try {
    console.log('🔍 Detecting faces with CompreFace API...');
    
    // Use FormData for file upload
    const formData = new FormData();
    formData.append('file', imageFile);
    
    // Build query parameters
    const params = new URLSearchParams({
      face_plugins: 'age,gender,landmarks,mask,pose,calculator',
      det_prob_threshold: '0.8'
    });
    
    // Use direct HTTP API call
    const response = await fetch(`${baseUrl}/api/v1/detection/detect?${params}`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();

    console.log('✅ Face detection successful:', {
      facesDetected: result.result?.length || 0,
      firstFace: result.result?.[0] ? {
        age: result.result[0].age,
        gender: result.result[0].gender,
        landmarks: result.result[0].landmarks?.length || 0
      } : null
    });

    return result;
  } catch (error) {
    console.error('❌ Face detection failed:', error);
    throw new Error(`Face detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to convert File to base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data:image/jpeg;base64, prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}

// Helper function to check if CompreFace is available
export async function checkCompreFaceHealth() {
  try {
    const response = await fetch(`${baseUrl}/api/v1/health`, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      return result.status === 'ok' || result.status === 'OK';
    }
    
    return false;
  } catch (error) {
    console.log('CompreFace health check failed:', error);
    return false;
  }
}
