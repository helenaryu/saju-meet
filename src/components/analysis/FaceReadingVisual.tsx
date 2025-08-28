"use client"

import React from 'react'

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
}

export default function FaceReadingVisual({ gender, facePoints, className = '' }: FaceReadingVisualProps) {
  
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
      {/* 관상 분석 요약 */}
      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl p-6 border border-green-400/30">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-green-300 mb-2">👁️ 관상 분석</h3>
          <p className="text-gray-400 italic">얼굴 부위별 의미와 연애 성향</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {points.map((point, index) => (
            <div key={point.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-start gap-3 mb-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r ${getCategoryColor(point.category)} flex items-center justify-center text-white font-bold text-sm`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-green-300 mb-2">{point.label}</h4>
                  <p className="text-gray-200 text-sm leading-relaxed">{point.analysis}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 관상 종합 분석 */}
      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-400/30">
        <h3 className="text-xl font-semibold text-green-300 mb-4 text-center">📋 관상 종합 분석</h3>
        <div className="text-center text-gray-200 leading-relaxed">
          <p className="mb-4">
            {gender === 'male' 
              ? '전체적으로 균형 잡힌 얼굴 형태를 가지고 있어, 감정과 이성의 조화가 잘 이루어진 성향입니다. 특히 눈과 입 부위의 조화가 돋보여, 연애에서 상대방과의 깊이 있는 교감을 이끌어낼 수 있는 분입니다.'
              : '부드럽고 조화로운 얼굴 형태로, 따뜻하고 포용력 있는 성향을 나타냅니다. 특히 뺨과 턱 부위의 균형이 좋아, 연애에서 안정감과 따뜻함을 제공할 수 있는 분입니다.'
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
