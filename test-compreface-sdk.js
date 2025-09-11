// Test script for CompreFace SDK
const { CompreFace } = require('@exadel/compreface-js-sdk');

async function testCompreFaceSDK() {
  console.log('🧪 Testing CompreFace SDK...');
  
  try {
    const compreface = new CompreFace('http://localhost', 8000);
    const detectionService = compreface.initFaceDetectionService('00000000-0000-0000-0000-000000000003');
    
    console.log('✅ CompreFace SDK initialized successfully');
    console.log('🔍 Testing detection service...');
    
    // Test with a simple base64 image (1x1 pixel)
    const testBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    const result = await detectionService.detect(testBase64, {
      face_plugins: 'age,gender,landmarks,mask,pose,calculator',
      det_prob_threshold: '0.8'
    });
    
    console.log('✅ Detection test completed');
    console.log('📊 Result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('💡 Make sure CompreFace is running on http://localhost:8000');
  }
}

// Run the test
testCompreFaceSDK();
