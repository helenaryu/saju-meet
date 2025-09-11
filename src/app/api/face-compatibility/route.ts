import { NextRequest, NextResponse } from 'next/server';
import { comprefaceService } from '@/lib/api/compreface';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const user1ImageId = formData.get('user1ImageId') as string;
    const user2ImageFile = formData.get('user2Image') as File;
    const analysisType = formData.get('analysisType') as string; // 'compatibility', 'similarity'

    if (!user1ImageId || !user2ImageFile) {
      return NextResponse.json(
        { error: '사용자1 이미지 ID와 사용자2 이미지 파일이 필요합니다.' },
        { status: 400 }
      );
    }

    // CompreFace 서버 상태 확인
    const isHealthy = await comprefaceService.checkHealth();
    
    if (!isHealthy) {
      return NextResponse.json(
        { 
          error: 'CompreFace 서버가 사용 불가능합니다. 서버를 시작하고 API 키를 설정해주세요.',
          code: 'COMPREFACE_UNAVAILABLE'
        },
        { status: 503 }
      );
    }

    try {
      let result;

      switch (analysisType) {
        case 'compatibility':
          result = await handleCompatibilityAnalysis(user1ImageId, user2ImageFile);
          break;

        case 'similarity':
          result = await handleSimilarityAnalysis(user1ImageId, user2ImageFile);
          break;

        default:
          result = await handleCompatibilityAnalysis(user1ImageId, user2ImageFile);
      }

      return NextResponse.json({
        success: true,
        data: result,
      });

    } catch (comprefaceError) {
      console.error('CompreFace 궁합 분석 실패:', comprefaceError);
      return NextResponse.json(
        { 
          error: '궁합 분석에 실패했습니다. CompreFace 서버를 확인해주세요.',
          code: 'COMPREFACE_ANALYSIS_FAILED',
          details: comprefaceError instanceof Error ? comprefaceError.message : String(comprefaceError)
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('얼굴 궁합 분석 API 오류:', error);
    return NextResponse.json(
      { error: '얼굴 궁합 분석 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 궁합 분석 처리
async function handleCompatibilityAnalysis(user1ImageId: string, user2ImageFile: File) {
  try {
    const compatibilityResult = await comprefaceService.analyzeCompatibility(user1ImageId, user2ImageFile);
    
    // 추가적인 궁합 분석
    const enhancedAnalysis = enhanceCompatibilityAnalysis(compatibilityResult);
    
    return {
      analysisType: 'compatibility',
      user1ImageId,
      compatibility: {
        overallScore: compatibilityResult.overallCompatibility,
        similarity: compatibilityResult.similarity,
        ageCompatibility: compatibilityResult.ageCompatibility,
        facialHarmony: compatibilityResult.facialHarmony,
        ...enhancedAnalysis
      },
      recommendation: generateCompatibilityRecommendation(compatibilityResult.overallCompatibility),
      message: '궁합 분석이 완료되었습니다.'
    };
  } catch (error) {
    console.error('궁합 분석 오류:', error);
    throw new Error('궁합 분석에 실패했습니다.');
  }
}

// 유사도 분석 처리
async function handleSimilarityAnalysis(user1ImageId: string, user2ImageFile: File) {
  try {
    const verificationResult = await comprefaceService.verifyFaces(user1ImageId, user2ImageFile);
    
    if (!verificationResult.result || verificationResult.result.length === 0) {
      throw new Error('얼굴 검증 결과를 가져올 수 없습니다.');
    }

    const faceData = verificationResult.result[0];
    const similarity = faceData.similarity || 0;

    return {
      analysisType: 'similarity',
      user1ImageId,
      similarity: {
        score: similarity,
        percentage: Math.round(similarity * 100),
        level: getSimilarityLevel(similarity),
        description: getSimilarityDescription(similarity)
      },
      faceData: {
        bbox: faceData.bbox,
        age: faceData.age,
        gender: faceData.gender,
        pose: faceData.pose,
        embedding: faceData.embedding,
      },
      message: '유사도 분석이 완료되었습니다.'
    };
  } catch (error) {
    console.error('유사도 분석 오류:', error);
    throw new Error('유사도 분석에 실패했습니다.');
  }
}

// 궁합 분석 강화
function enhanceCompatibilityAnalysis(compatibilityResult: any) {
  const { similarity, ageCompatibility, facialHarmony, overallCompatibility } = compatibilityResult;
  
  // 추가 분석 요소들
  const enhancedAnalysis = {
    personalityMatch: analyzePersonalityMatch(overallCompatibility),
    communicationStyle: analyzeCommunicationStyle(similarity, facialHarmony.score),
    relationshipPotential: analyzeRelationshipPotential(overallCompatibility),
    strengths: generateStrengths(compatibilityResult),
    areasForGrowth: generateAreasForGrowth(compatibilityResult)
  };

  return enhancedAnalysis;
}

// 성격 매치 분석
function analyzePersonalityMatch(overallScore: number) {
  if (overallScore > 0.8) {
    return {
      score: overallScore,
      description: '매우 높은 성격 매치를 보입니다.',
      traits: ['호환성', '이해심', '공감능력']
    };
  } else if (overallScore > 0.6) {
    return {
      score: overallScore,
      description: '좋은 성격 매치를 보입니다.',
      traits: ['균형감', '상호보완', '안정성']
    };
  } else {
    return {
      score: overallScore,
      description: '서로 다른 매력을 가진 성격입니다.',
      traits: ['다양성', '성장가능성', '새로움']
    };
  }
}

// 소통 스타일 분석
function analyzeCommunicationStyle(similarity: number, facialHarmony: number) {
  const communicationScore = (similarity + facialHarmony) / 2;
  
  if (communicationScore > 0.7) {
    return {
      score: communicationScore,
      description: '자연스러운 소통이 가능합니다.',
      style: '직관적 소통'
    };
  } else if (communicationScore > 0.5) {
    return {
      score: communicationScore,
      description: '서로 이해하려는 노력이 필요합니다.',
      style: '균형적 소통'
    };
  } else {
    return {
      score: communicationScore,
      description: '서로 다른 소통 방식을 이해해야 합니다.',
      style: '보완적 소통'
    };
  }
}

// 관계 잠재력 분석
function analyzeRelationshipPotential(overallScore: number) {
  if (overallScore > 0.8) {
    return {
      score: overallScore,
      level: '매우 높음',
      description: '장기적인 관계 발전 가능성이 높습니다.',
      timeline: '즉시 시작 가능'
    };
  } else if (overallScore > 0.6) {
    return {
      score: overallScore,
      level: '높음',
      description: '서로 노력하면 좋은 관계를 만들 수 있습니다.',
      timeline: '점진적 발전'
    };
  } else {
    return {
      score: overallScore,
      level: '보통',
      description: '서로의 차이를 인정하고 이해하는 것이 중요합니다.',
      timeline: '신중한 접근'
    };
  }
}

// 강점 생성
function generateStrengths(compatibilityResult: any) {
  const strengths = [];
  
  if (compatibilityResult.similarity > 0.7) {
    strengths.push('높은 얼굴 유사도로 자연스러운 친밀감');
  }
  
  if (compatibilityResult.ageCompatibility.score > 0.8) {
    strengths.push('나이대별 궁합이 우수함');
  }
  
  if (compatibilityResult.facialHarmony.score > 0.7) {
    strengths.push('얼굴 조화가 뛰어남');
  }
  
  if (compatibilityResult.overallCompatibility > 0.8) {
    strengths.push('전반적인 궁합이 매우 좋음');
  }
  
  return strengths.length > 0 ? strengths : ['서로 다른 매력으로 보완 가능'];
}

// 성장 영역 생성
function generateAreasForGrowth(compatibilityResult: any) {
  const areas = [];
  
  if (compatibilityResult.similarity < 0.5) {
    areas.push('서로의 차이점을 이해하고 존중하기');
  }
  
  if (compatibilityResult.ageCompatibility.score < 0.6) {
    areas.push('나이 차이로 인한 관점 차이 이해하기');
  }
  
  if (compatibilityResult.facialHarmony.score < 0.6) {
    areas.push('서로의 개성을 인정하고 받아들이기');
  }
  
  return areas.length > 0 ? areas : ['지속적인 소통과 이해'];
}

// 궁합 추천 생성
function generateCompatibilityRecommendation(overallScore: number) {
  if (overallScore > 0.8) {
    return {
      level: '매우 추천',
      message: '높은 궁합을 보이므로 적극적으로 만나보세요!',
      tips: [
        '자연스러운 대화를 나누세요',
        '서로의 관심사를 공유하세요',
        '함께 새로운 경험을 해보세요'
      ]
    };
  } else if (overallScore > 0.6) {
    return {
      level: '추천',
      message: '좋은 궁합을 보이므로 만나볼 가치가 있습니다.',
      tips: [
        '서로의 차이점을 이해하려 노력하세요',
        '공통 관심사를 찾아보세요',
        '점진적으로 관계를 발전시키세요'
      ]
    };
  } else {
    return {
      level: '신중',
      message: '서로 다른 매력을 가진 관계입니다.',
      tips: [
        '서로의 개성을 존중하세요',
        '차이점을 단점이 아닌 장점으로 보세요',
        '충분한 시간을 가지고 알아가세요'
      ]
    };
  }
}

// 유사도 레벨 반환
function getSimilarityLevel(similarity: number) {
  if (similarity > 0.8) return '매우 높음';
  if (similarity > 0.6) return '높음';
  if (similarity > 0.4) return '보통';
  if (similarity > 0.2) return '낮음';
  return '매우 낮음';
}

// 유사도 설명 반환
function getSimilarityDescription(similarity: number) {
  if (similarity > 0.8) return '거의 동일한 얼굴 특성을 가지고 있습니다.';
  if (similarity > 0.6) return '비슷한 얼굴 특성을 가지고 있습니다.';
  if (similarity > 0.4) return '일부 유사한 얼굴 특성이 있습니다.';
  if (similarity > 0.2) return '약간의 유사한 특성이 있습니다.';
  return '서로 다른 얼굴 특성을 가지고 있습니다.';
}
