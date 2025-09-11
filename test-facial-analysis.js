/**
 * 관상 분석 시스템 테스트 스크립트
 * 
 * 이 스크립트는 새로운 관상 분석 플로우를 테스트합니다:
 * 1. CompreFace로 얼굴 분석
 * 2. Rule-based mapping으로 관상 특징 추출
 * 3. Claude AI로 개인화된 리포트 생성
 */

const fs = require('fs');
const path = require('path');

// 테스트용 더미 이미지 생성 (1x1 픽셀 PNG)
function createDummyImage() {
  // 1x1 픽셀 PNG 이미지 (Base64)
  const dummyImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  const buffer = Buffer.from(dummyImageBase64, 'base64');
  
  const testImagePath = path.join(__dirname, 'test-image.png');
  fs.writeFileSync(testImagePath, buffer);
  
  return testImagePath;
}

// 관상 분석 API 테스트
async function testFacialAnalysis() {
  console.log('🧪 관상 분석 시스템 테스트 시작');
  
  try {
    // 1. 더미 이미지 생성
    console.log('📸 테스트용 이미지 생성 중...');
    const imagePath = createDummyImage();
    console.log('✅ 테스트 이미지 생성 완료:', imagePath);
    
    // 2. FormData 생성
    const FormData = require('form-data');
    const formData = new FormData();
    
    // 이미지 파일 추가
    const imageStream = fs.createReadStream(imagePath);
    formData.append('imageFile', imageStream, {
      filename: 'test-image.png',
      contentType: 'image/png'
    });
    
    // 추가 데이터
    formData.append('nickname', '테스트사용자');
    formData.append('gender', '미지정');
    formData.append('birthDate', '1990-01-01');
    
    // 3. API 호출
    console.log('🚀 관상 분석 API 호출 중...');
    const response = await fetch('http://localhost:3000/api/facial-analysis', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });
    
    console.log('📊 API 응답 상태:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API 호출 실패:', errorText);
      return;
    }
    
    const result = await response.json();
    console.log('✅ API 호출 성공!');
    
    // 4. 결과 분석
    console.log('\n📋 분석 결과:');
    console.log('==================');
    
    if (result.success && result.data) {
      const data = result.data;
      
      // CompreFace 데이터
      console.log('\n🔍 CompreFace 분석:');
      console.log('- 나이:', data.comprefaceData.age || 'N/A');
      console.log('- 성별:', data.comprefaceData.gender || 'N/A');
      console.log('- 랜드마크 수:', data.comprefaceData.landmarks || 0);
      
      // 매핑된 관상 특징
      console.log('\n👁️ 관상 특징:');
      console.log('- 눈:', data.facialFeatures.eyes.shape, data.facialFeatures.eyes.size);
      console.log('- 코:', data.facialFeatures.nose.bridge, data.facialFeatures.nose.tip);
      console.log('- 입:', data.facialFeatures.mouth.shape, data.facialFeatures.mouth.size);
      console.log('- 이마:', data.facialFeatures.forehead.width, data.facialFeatures.forehead.height);
      console.log('- 턱:', data.facialFeatures.chin.shape);
      console.log('- 얼굴형:', data.facialFeatures.overall.faceShape);
      
      // Claude 분석
      console.log('\n🤖 Claude AI 분석:');
      console.log('- 해석:', data.claudeAnalysis.interpretation);
      console.log('- 연애 스타일:', data.claudeAnalysis.loveStyle);
      console.log('- 이상형:', data.claudeAnalysis.idealTypeDescription);
      
      // 키워드
      console.log('\n🏷️ 키워드:');
      console.log('- 관상 키워드:', data.keywords.slice(0, 5).join(', '));
      console.log('- 연애 궁합:', data.loveCompatibility.slice(0, 3).join(', '));
      
      // 메타데이터
      console.log('\n📊 메타데이터:');
      console.log('- 신뢰도:', Math.round(data.metadata.confidence * 100) + '%');
      console.log('- 처리 시간:', data.metadata.processingTime + 'ms');
      console.log('- 분석 버전:', data.metadata.analysisVersion);
      
    } else {
      console.error('❌ 분석 결과가 올바르지 않습니다:', result);
    }
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error.message);
  } finally {
    // 5. 정리
    console.log('\n🧹 테스트 정리 중...');
    try {
      const imagePath = path.join(__dirname, 'test-image.png');
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log('✅ 테스트 이미지 삭제 완료');
      }
    } catch (cleanupError) {
      console.warn('⚠️ 정리 중 오류:', cleanupError.message);
    }
  }
}

// 서버 상태 확인
async function checkServerStatus() {
  try {
    console.log('🔍 서버 상태 확인 중...');
    const response = await fetch('http://localhost:3000/api/health', {
      method: 'GET'
    });
    
    if (response.ok) {
      console.log('✅ 서버가 정상 작동 중입니다');
      return true;
    } else {
      console.log('⚠️ 서버가 응답하지 않습니다 (상태:', response.status + ')');
      return false;
    }
  } catch (error) {
    console.log('❌ 서버에 연결할 수 없습니다:', error.message);
    console.log('💡 개발 서버를 실행해주세요: npm run dev');
    return false;
  }
}

// 메인 실행
async function main() {
  console.log('🎯 관상 분석 시스템 통합 테스트');
  console.log('=====================================\n');
  
  // 서버 상태 확인
  const serverRunning = await checkServerStatus();
  if (!serverRunning) {
    console.log('\n❌ 서버가 실행되지 않아 테스트를 중단합니다.');
    process.exit(1);
  }
  
  // 관상 분석 테스트 실행
  await testFacialAnalysis();
  
  console.log('\n🎉 테스트 완료!');
  console.log('\n📝 다음 단계:');
  console.log('1. 실제 얼굴 사진으로 테스트');
  console.log('2. CompreFace 서버 설정 확인');
  console.log('3. Claude API 키 설정 확인');
  console.log('4. 프론트엔드에서 통합 테스트');
}

// 스크립트 실행
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testFacialAnalysis, checkServerStatus };
