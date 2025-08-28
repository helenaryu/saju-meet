"use client"

import React from 'react'

interface FacePoint {
  id: string
  x: number
  y: number
  label: string
  analysis: string
  category: 'forehead' | 'eyes' | 'nose' | 'mouth' | 'cheeks' | 'chin'
}

interface FaceReadingVisualProps {
  gender: 'male' | 'female'
  facePoints: FacePoint[]
  className?: string
}

export default function FaceReadingVisual({ gender, facePoints, className = '' }: FaceReadingVisualProps) {
  const isMale = gender === 'male'
  
  // 성별에 따른 기본 얼굴 형태와 포인트 위치 조정
  const getFacePoints = (): FacePoint[] => {
    if (facePoints.length > 0) {
      return facePoints
    }
    
    // 기본 포인트들 (성별에 따라 위치 조정)
    return [
      {
        id: 'forehead',
        x: isMale ? 45 : 55,
        y: 15,
        label: '이마',
        analysis: '정신적 성향과 이상을 추구하는 마음',
        category: 'forehead'
      },
      {
        id: 'left-eye',
        x: isMale ? 35 : 45,
        y: 35,
        label: '왼쪽 눈',
        analysis: '직관적이고 감성적인 성향',
        category: 'eyes'
      },
      {
        id: 'right-eye',
        x: isMale ? 55 : 65,
        y: 35,
        label: '오른쪽 눈',
        analysis: '논리적이고 분석적인 성향',
        category: 'eyes'
      },
      {
        id: 'nose',
        x: isMale ? 45 : 55,
        y: 55,
        label: '코',
        analysis: '의지력과 리더십',
        category: 'nose'
      },
      {
        id: 'mouth',
        x: isMale ? 45 : 55,
        y: 75,
        label: '입',
        analysis: '소통 능력과 감정 표현',
        category: 'mouth'
      },
      {
        id: 'left-cheek',
        x: isMale ? 25 : 35,
        y: 55,
        label: '왼쪽 뺨',
        analysis: '감정적 안정성',
        category: 'cheeks'
      },
      {
        id: 'right-cheek',
        x: isMale ? 65 : 75,
        y: 55,
        label: '오른쪽 뺨',
        analysis: '사회적 적응력',
        category: 'cheeks'
      },
      {
        id: 'chin',
        x: isMale ? 45 : 55,
        y: 90,
        label: '턱',
        analysis: '지혜와 성숙함',
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
      chin: 'from-teal-400 to-cyan-500'
    }
    return colors[category as keyof typeof colors] || 'from-gray-400 to-gray-500'
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* 얼굴 이미지와 포인트 */}
        <div className="relative flex-shrink-0">
          <div className="relative w-80 h-96">
            {/* 기본 얼굴 형태 */}
            <div className="absolute inset-0">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* 얼굴 윤곽선 */}
                <ellipse
                  cx="50"
                  cy="50"
                  rx={isMale ? "35" : "32"}
                  ry="45"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="2"
                  className="opacity-30"
                />
                
                {/* 포인트들과 연결선 */}
                {points.map((point, index) => (
                  <g key={point.id}>
                    {/* 포인트 */}
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="2"
                      fill="url(#gradient)"
                      className="animate-pulse"
                    />
                    
                    {/* 포인트 번호 */}
                    <text
                      x={point.x}
                      y={point.y - 3}
                      textAnchor="middle"
                      className="text-xs font-bold fill-amber-400"
                    >
                      {index + 1}
                    </text>
                    
                    {/* 연결선 (다음 포인트와 연결) */}
                    {index < points.length - 1 && (
                      <line
                        x1={point.x}
                        y1={point.y}
                        x2={points[index + 1].x}
                        y2={points[index + 1].y}
                        stroke="#fbbf24"
                        strokeWidth="1"
                        className="opacity-20"
                      />
                    )}
                  </g>
                ))}
                
                {/* 그라데이션 정의 */}
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            
            {/* 성별 표시 */}
            <div className="absolute top-2 left-2 bg-amber-400 text-black px-2 py-1 rounded-full text-xs font-bold">
              {isMale ? '남성' : '여성'}
            </div>
          </div>
        </div>

        {/* 분석 내용 */}
        <div className="flex-1 min-w-0">
          <div className="space-y-4">
            {points.map((point, index) => (
              <div key={point.id} className="group">
                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                  {/* 포인트 번호 */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r ${getCategoryColor(point.category)} flex items-center justify-center text-white font-bold text-sm`}>
                    {index + 1}
                  </div>
                  
                  {/* 분석 내용 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-lg font-semibold text-amber-400">
                        {point.label}
                      </h4>
                      <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded-full">
                        {point.category}
                      </span>
                    </div>
                    <p className="text-gray-200 leading-relaxed">
                      {point.analysis}
                    </p>
                    
                    {/* 추가 상세 분석 (호버 시 표시) */}
                    <div className="mt-3 text-sm text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p>
                        {point.category === 'forehead' && '이마는 정신적 성향과 이상을 나타내며, 연애에서도 깊이 있는 사고와 이상을 추구하는 모습을 보여줍니다.'}
                        {point.category === 'eyes' && '눈은 마음의 창으로, 감정 표현과 직관력을 나타냅니다. 연애에서 상대방의 마음을 읽는 능력과 관련이 있습니다.'}
                        {point.category === 'nose' && '코는 의지력과 리더십을 나타내며, 연애에서 주도적으로 이끌어가는 성향과 관련이 있습니다.'}
                        {point.category === 'mouth' && '입은 소통 능력과 감정 표현을 나타내며, 연애에서의 대화와 감정 교류 능력을 보여줍니다.'}
                        {point.category === 'cheeks' && '뺨은 감정적 안정성과 사회적 적응력을 나타내며, 연애에서의 안정감과 조화 능력을 보여줍니다.'}
                        {point.category === 'chin' && '턱은 지혜와 성숙함을 나타내며, 연애에서의 성숙한 사랑과 이해력을 보여줍니다.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* 전체 요약 */}
          <div className="mt-8 p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-400/30">
            <h3 className="text-xl font-semibold text-amber-400 mb-3">전체 관상 요약</h3>
            <p className="text-gray-200 leading-relaxed">
              {isMale 
                ? '전체적으로 균형 잡힌 얼굴 형태를 가지고 있어, 감정과 이성의 조화가 잘 이루어진 성향입니다. 특히 눈과 입 부위의 조화가 돋보여, 연애에서 상대방과의 깊이 있는 교감을 이끌어낼 수 있는 분입니다.'
                : '부드럽고 조화로운 얼굴 형태로, 따뜻하고 포용력 있는 성향을 나타냅니다. 특히 뺨과 턱 부위의 균형이 좋아, 연애에서 안정감과 따뜻함을 제공할 수 있는 분입니다.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
