"use client"

import React, { useState, useCallback } from 'react'
import { faceReadingService, FaceReadingRequest } from '@/lib/api/faceReading'

interface FacePoint {
  id: string
  label: string
  analysis: string
  category: 'forehead' | 'eyes' | 'nose' | 'mouth' | 'cheeks' | 'chin' | 'ears'
}

interface FaceReadingVisualProps {
  gender: 'male' | 'female'
  facePoints: FacePoint[]
  className?: string
  imageFile?: File
  onAnalysisComplete?: (result: any) => void
}

export default function FaceReadingVisual({ 
  gender, 
  facePoints, 
  className = '', 
  imageFile, 
  onAnalysisComplete 
}: FaceReadingVisualProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // CompreFace를 통한 실제 얼굴 분석
  const performFaceAnalysis = useCallback(async () => {
    if (!imageFile) {
      setError('이미지 파일이 필요합니다.')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const request: FaceReadingRequest = {
        imageFile: imageFile
      }

      const result = await faceReadingService.analyzeFace(request)
      setAnalysisResult(result)
      
      if (onAnalysisComplete) {
        onAnalysisComplete(result)
      }
    } catch (err) {
      console.error('얼굴 분석 오류:', err)
      setError(err instanceof Error ? err.message : '얼굴 분석에 실패했습니다.')
    } finally {
      setIsAnalyzing(false)
    }
  }, [imageFile, onAnalysisComplete])

  // 이미지가 제공되면 자동으로 분석 시작
  React.useEffect(() => {
    if (imageFile && !analysisResult && !isAnalyzing) {
      performFaceAnalysis()
    }
  }, [imageFile, analysisResult, isAnalyzing, performFaceAnalysis])

  // 기본 포인트들
  const getFacePoints = (): FacePoint[] => {
    if (facePoints.length > 0) {
      return facePoints
    }
    
    return [
      {
        id: 'forehead',
        label: '이마',
        analysis: '정신적 성향과 이상을 추구하는 마음을 나타냅니다. 연애에서도 깊이 있는 사고와 이상을 추구하는 모습을 보여줍니다.',
        category: 'forehead'
      },
      {
        id: 'left-eye',
        label: '왼쪽 눈',
        analysis: '직관적이고 감성적인 성향을 나타냅니다. 상대방의 마음을 읽는 능력과 감정적 교감 능력을 보여줍니다.',
        category: 'eyes'
      },
      {
        id: 'right-eye',
        label: '오른쪽 눈',
        analysis: '논리적이고 분석적인 성향을 나타냅니다. 연애에서의 판단력과 이성적 사고를 보여줍니다.',
        category: 'eyes'
      },
      {
        id: 'nose',
        label: '코',
        analysis: '의지력과 리더십을 나타냅니다. 연애에서 주도적으로 이끌어가는 성향과 결단력을 보여줍니다.',
        category: 'nose'
      },
      {
        id: 'mouth',
        label: '입',
        analysis: '소통 능력과 감정 표현을 나타냅니다. 연애에서의 대화와 감정 교류 능력을 보여줍니다.',
        category: 'mouth'
      },
      {
        id: 'left-cheek',
        label: '왼쪽 뺨',
        analysis: '감정적 안정성을 나타냅니다. 연애에서의 안정감과 조화 능력을 보여줍니다.',
        category: 'cheeks'
      },
      {
        id: 'right-cheek',
        label: '오른쪽 뺨',
        analysis: '사회적 적응력을 나타냅니다. 연애에서의 적응력과 관계 형성 능력을 보여줍니다.',
        category: 'cheeks'
      },
      {
        id: 'chin',
        label: '턱',
        analysis: '지혜와 성숙함을 나타냅니다. 연애에서의 성숙한 사랑과 이해력을 보여줍니다.',
        category: 'chin'
      }
    ]
  }

  const points = getFacePoints()
  
  const getCategoryColor = (category: string) => {
    const colors = {
      forehead: 'from-amber-400 to-orange-500',
      eyes: 'from-blue-400 to-indigo-500',
      nose: 'from-green-400 to-emerald-500',
      mouth: 'from-pink-400 to-rose-500',
      cheeks: 'from-purple-400 to-violet-500',
      chin: 'from-teal-400 to-cyan-500',
      ears: 'from-indigo-400 to-purple-500'
    }
    return colors[category as keyof typeof colors] || 'from-gray-400 to-gray-500'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 분석 상태 표시 */}
      {isAnalyzing && (
        <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-2xl p-6 border border-blue-400/30">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-blue-300 mb-2">🔍 얼굴 분석 중...</h3>
            <p className="text-gray-300">CompreFace를 통해 얼굴을 분석하고 있습니다.</p>
          </div>
        </div>
      )}

      {/* 오류 표시 */}
      {error && (
        <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-2xl p-6 border border-red-400/30">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-red-300 mb-2">❌ 분석 오류</h3>
            <p className="text-gray-300 mb-4">{error}</p>
            
            {/* CompreFace 관련 오류인 경우 추가 안내 */}
            {error.includes('CompreFace') && (
              <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-4 mb-4">
                <h4 className="text-yellow-300 font-semibold mb-2">🔧 CompreFace 설정 필요</h4>
                <p className="text-yellow-200 text-sm mb-2">
                  실제 얼굴 분석을 위해서는 CompreFace 서버가 필요합니다.
                </p>
                <div className="text-yellow-200 text-xs space-y-1">
                  <p>1. Docker Desktop 설치</p>
                  <p>2. <code className="bg-yellow-500/20 px-1 rounded">./setup-compreface.sh</code> 실행</p>
                  <p>3. API 키 설정 후 재시도</p>
                </div>
              </div>
            )}
            
            <button
              onClick={performFaceAnalysis}
              className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg border border-red-400/30 hover:bg-red-500/30 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      )}

      {/* CompreFace 분석 결과 */}
      {analysisResult && (
        <div className="bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-2xl p-6 border border-purple-400/30">
          <h3 className="text-xl font-semibold text-purple-300 mb-4 text-center">🤖 AI 관상 분석 결과</h3>
          
          {/* 키워드 */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-purple-300 mb-3">🌟 주요 키워드</h4>
            <div className="flex flex-wrap gap-2">
              {analysisResult.keywords?.map((keyword: string, index: number) => (
                <span key={index} className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm border border-purple-400/30">
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          {/* 상세 해석 */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-purple-300 mb-3">📝 상세 해석</h4>
            <p className="text-gray-200 leading-relaxed">
              {analysisResult.interpretation}
            </p>
          </div>

          {/* 연애 궁합 */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-purple-300 mb-3">💕 연애 궁합</h4>
            <ul className="space-y-2">
              {analysisResult.loveCompatibility?.map((compatibility: string, index: number) => (
                <li key={index} className="text-gray-200 flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  {compatibility}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 관상 종합 분석 */}
      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-400/30">
        <h3 className="text-xl font-semibold text-green-300 mb-4 text-center">📋 관상 종합 분석</h3>
        <div className="text-center text-gray-200 leading-relaxed">
          <p className="mb-4">
            {gender === 'male' 
              ? '전체적으로 균형 잡힌 얼굴 형태를 가지고 있어, 감정과 이성의 조화가 잘 이루어진 성향입니다. 특히 눈과 입 부위의 조화가 돋보여, 연애에서 상대방과의 깊이 있는 교감을 이끌어낼 수 있는 분입니다. 이마의 형태가 보여주는 것은 정신적 성향과 이상을 추구하는 마음을 가지고 있다는 것이고, 이는 연애에서도 단순한 감정 교류가 아닌 함께 성장할 수 있는 깊이 있는 관계를 추구한다는 의미입니다.'
              : '부드럽고 조화로운 얼굴 형태로, 따뜻하고 포용력 있는 성향을 나타냅니다. 특히 뺨과 턱 부위의 균형이 좋아, 연애에서 안정감과 따뜻함을 제공할 수 있는 분입니다. 눈의 형태가 보여주는 것은 직관적이고 감성적인 성향을 가지고 있다는 것이고, 이는 연애에서 상대방의 마음을 깊이 이해하고 공감할 수 있는 능력이 뛰어나다는 의미입니다.'
            }
          </p>
          <p className="mb-4">
            {gender === 'male'
              ? '코와 입 부위의 형태가 보여주는 것은 강한 의지력과 뛰어난 소통 능력을 가지고 있다는 것입니다. 이는 연애에서 상대방에게 안전감을 주면서도, 함께 성장해나가는 깊이 있는 관계를 만들어갈 수 있다는 것을 나타냅니다. 특히 귀와 턱 부위의 조화가 좋아서, 상대방의 말을 진심으로 듣고 이해할 수 있는 능력과 함께 성숙한 판단력을 가지고 있어 장기적인 관계 형성에 매우 적합한 성향을 보여줍니다.'
              : '코와 입 부위의 형태가 보여주는 것은 강한 의지력과 뛰어난 소통 능력을 가지고 있다는 것입니다. 이는 연애에서 상대방에게 안전감을 주면서도, 함께 성장해나가는 깊이 있는 관계를 만들어갈 수 있다는 것을 나타냅니다. 특히 귀와 턱 부위의 조화가 좋아서, 상대방의 말을 진심으로 듣고 이해할 수 있는 능력과 함께 성숙한 판단력을 가지고 있어 장기적인 관계 형성에 매우 적합한 성향을 보여줍니다.'
            }
          </p>
          <p>
            {gender === 'male'
              ? '관상학적으로 볼 때, 당신은 감정적 안정성과 지적 깊이를 동시에 가지고 있는 사람입니다. 이는 연애에서 상대방에게 안전감을 주면서도, 함께 성장할 수 있는 깊이 있는 관계를 만들어갈 수 있다는 의미예요. 당신의 얼굴이 말하는 이야기는 "진정성 있는 사랑"을 추구하는 사람이라는 것입니다. 특히 연애에서 상대방과의 깊이 있는 교감을 추구하며, 함께 성장해나가는 관계를 만드는 데 탁월한 능력을 가지고 있습니다.'
              : '관상학적으로 볼 때, 당신은 감정적 안정성과 지적 깊이를 동시에 가지고 있는 사람입니다. 이는 연애에서 상대방에게 안전감을 주면서도, 함께 성장할 수 있는 깊이 있는 관계를 만들어갈 수 있다는 의미예요. 당신의 얼굴이 말하는 이야기는 "진정성 있는 사랑"을 추구하는 사람이라는 것입니다. 특히 연애에서 상대방과의 깊이 있는 교감을 추구하며, 함께 성장해나가는 관계를 만드는 데 탁월한 능력을 가지고 있습니다.'
            }
          </p>
        </div>
        
        {/* 키워드 */}
        <div className="mt-6 text-center">
          <h4 className="text-lg font-semibold text-green-300 mb-3">🌟 주요 키워드</h4>
          <div className="flex flex-wrap justify-center gap-2">
            {gender === 'male' 
              ? ['균형감', '조화', '교감능력', '안정성', '리더십'].map((keyword, index) => (
                  <span key={index} className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm border border-green-400/30">
                    {keyword}
                  </span>
                ))
              : ['부드러움', '포용력', '안정감', '따뜻함', '조화'].map((keyword, index) => (
                  <span key={index} className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm border border-green-400/30">
                    {keyword}
                  </span>
                ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}
