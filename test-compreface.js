// Simple test script to verify CompreFace integration
const testCompreFace = async () => {
  console.log('🧪 Testing CompreFace integration...');
  
  try {
    // Test health check
    const healthResponse = await fetch('http://localhost:8000/api/v1/health');
    console.log('Health check status:', healthResponse.status);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ CompreFace is healthy:', healthData);
    } else {
      console.log('❌ CompreFace health check failed');
    }
    
    // Test face analysis API
    const testImageResponse = await fetch('http://localhost:3000/api/face-analysis', {
      method: 'POST',
      body: new FormData() // Empty form data to test error handling
    });
    
    console.log('Face analysis API status:', testImageResponse.status);
    
    if (testImageResponse.ok) {
      const analysisData = await testImageResponse.json();
      console.log('✅ Face analysis API working:', analysisData);
    } else {
      const errorData = await testImageResponse.json();
      console.log('❌ Face analysis API error:', errorData);
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
};

// Run test if this script is executed directly
if (typeof window === 'undefined') {
  testCompreFace();
}

module.exports = { testCompreFace };
