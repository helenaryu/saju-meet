"use client"

import React from 'react'

interface OhaengElement {
  name: string
  color: string
  icon: string
  description: string
  strength: number // 0-100
  keywords: string[]
}

interface SajuReadingVisualProps {
  birthDate: string
  birthTime: string
  birthPlace: string
  ohaengData?: {
    [key: string]: number
  }
  sajuKeywords: string[]
  className?: string
}

export default function SajuReadingVisual({ 
  birthDate, 
  birthTime, 
  birthPlace, 
  ohaengData, 
  sajuKeywords, 
  className = '' 
}: SajuReadingVisualProps) {
  
  // 오행 데이터 (기본값 또는 실제 데이터)
  const getOhaengElements = (): OhaengElement[] => {
    const defaultData = {
      wood: 25,
      fire: 20,
      earth: 15,
      metal: 25,
      water: 15
    }
    
    const data = ohaengData || defaultData
    
    return [
      {
        name: '목(木)',
        color: 'from-green-400 to-emerald-600',
        icon: '🌳',
        description: '성장과 확장의 기운',
        strength: data.wood || 25,
        keywords: ['창의성', '성장', '도전', '활력', '진보']
      },
      {
        name: '화(火)',
        color: 'from-red-400 to-rose-600',
        icon: '🔥',
        description: '열정과 에너지의 기운',
        strength: data.fire || 20,
        keywords: ['열정', '에너지', '리더십', '카리스마', '활동성']
      },
      {
        name: '토(土)',
        color: 'from-amber-400 to-orange-600',
        icon: '🏔️',
        description: '안정과 균형의 기운',
        strength: data.earth || 15,
        keywords: ['안정성', '균형', '신뢰성', '책임감', '조화']
      },
      {
        name: '금(金)',
        color: 'from-gray-400 to-slate-600',
        icon: '⚔️',
        description: '정의와 결단의 기운',
        strength: data.metal || 25,
        keywords: ['정의감', '결단력', '정직', '원칙', '정리']
      },
      {
        name: '수(水)',
        color: 'from-blue-400 to-indigo-600',
        icon: '🌊',
        description: '지혜와 유연성의 기운',
        strength: data.water || 15,
        keywords: ['지혜', '유연성', '직관', '적응력', '깊이']
      }
    ]
  }

  const ohaengElements = getOhaengElements()
  
  // 생년월일을 감성적으로 표현
  const getBirthDateDescription = () => {
    const date = new Date(birthDate)
    const month = date.getMonth() + 1
    const day = date.getDate()
    
    const monthDescriptions = {
      1: '새로운 시작의 달',
      2: '사랑이 피어나는 달',
      3: '봄의 생명력이 넘치는 달',
      4: '꽃이 만발하는 달',
      5: '푸른 생명의 달',
      6: '여름의 열정이 가득한 달',
      7: '무더위 속 시원한 달',
      8: '가을의 서늘함이 느껴지는 달',
      9: '황금빛 가을의 달',
      10: '단풍이 아름다운 달',
      11: '낙엽이 떨어지는 달',
      12: '겨울의 고요함이 있는 달'
    }
    
    return `${monthDescriptions[month as keyof typeof monthDescriptions]} ${day}일, 당신이 이 세상에 태어난 특별한 순간입니다.`
  }

  // 3D 도넛 차트 렌더링 함수
  const renderPieChart = () => {
    const total = ohaengElements.reduce((sum, element) => sum + element.strength, 0)
    let currentAngle = 0
    
    return (
      <div className="relative w-80 h-80 mx-auto mb-8">
        {/* 3D 도넛 차트 */}
        <svg width="320" height="320" viewBox="0 0 320 320" className="transform -rotate-90">
          <defs>
            {/* 3D 효과를 위한 그림자 필터 */}
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="3" dy="3" stdDeviation="3" floodColor="rgba(0,0,0,0.3)"/>
            </filter>
            
            {/* 그라데이션 정의 */}
            {ohaengElements.map((element) => (
              <linearGradient key={element.name} id={element.name.replace(/[()]/g, '')} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={element.color.split(' ')[1]} />
                <stop offset="100%" stopColor={element.color.split(' ')[3]} />
              </linearGradient>
            ))}
          </defs>
          
          {/* 도넛 차트 세그먼트들 */}
          {ohaengElements.map((element, index) => {
            const percentage = (element.strength / total) * 100
            const angle = (percentage / 100) * 360
            const largeArcFlag = angle > 180 ? 1 : 0
            
            const x1 = 160 + 120 * Math.cos(currentAngle * Math.PI / 180)
            const y1 = 160 + 120 * Math.sin(currentAngle * Math.PI / 180)
            const x2 = 160 + 120 * Math.cos((currentAngle + angle) * Math.PI / 180)
            const y2 = 160 + 120 * Math.sin((currentAngle + angle) * Math.PI / 180)
            
            // 도넛 차트를 위한 내부 반지름
            const innerRadius = 60
            const x1Inner = 160 + innerRadius * Math.cos(currentAngle * Math.PI / 180)
            const y1Inner = 160 + innerRadius * Math.sin(currentAngle * Math.PI / 180)
            const x2Inner = 160 + innerRadius * Math.cos((currentAngle + angle) * Math.PI / 180)
            const y2Inner = 160 + innerRadius * Math.sin((currentAngle + angle) * Math.PI / 180)
            
            // 도넛 차트 경로
            const path = `M ${x1} ${y1} A 120 120 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x2Inner} ${y2Inner} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1Inner} ${y1Inner} Z`
            
            // 퍼센트 텍스트 위치 계산
            const textAngle = currentAngle + (angle / 2)
            const textRadius = 100
            const textX = 160 + textRadius * Math.cos(textAngle * Math.PI / 180)
            const textY = 160 + textRadius * Math.sin(textAngle * Math.PI / 180)
            
            currentAngle += angle
            
            return (
              <g key={index}>
                <path
                  d={path}
                  fill={`url(#${element.name.replace(/[()]/g, '')})`}
                  stroke="white"
                  strokeWidth="2"
                  filter="url(#shadow)"
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
                {/* 퍼센트 텍스트 */}
                <text
                  x={textX}
                  y={textY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-sm font-bold fill-white"
                  style={{ fontSize: '14px' }}
                >
                  {Math.round(percentage)}%
                </text>
              </g>
            )
          })}
        </svg>
        
        {/* 중앙 텍스트 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">오행</div>
            <div className="text-sm text-gray-300">분석</div>
          </div>
        </div>
        
        {/* 연결선과 정보 박스들 */}
        <div className="absolute inset-0">
          {ohaengElements.map((element, index) => {
            const percentage = (element.strength / total) * 100
            const angle = (percentage / 100) * 360
            const totalAngle = ohaengElements.slice(0, index).reduce((sum, el) => sum + (el.strength / total) * 360, 0)
            const segmentAngle = totalAngle + (angle / 2)
            
            // 연결선 시작점 (도넛 차트 가장자리)
            const lineStartX = 160 + 140 * Math.cos(segmentAngle * Math.PI / 180)
            const lineStartY = 160 + 140 * Math.sin(segmentAngle * Math.PI / 180)
            
            // 정보 박스 위치 계산
            let boxX, boxY
            if (segmentAngle >= 0 && segmentAngle < 90) {
              boxX = lineStartX + 40
              boxY = lineStartY - 40
            } else if (segmentAngle >= 90 && segmentAngle < 180) {
              boxX = lineStartX - 40
              boxY = lineStartY - 40
            } else if (segmentAngle >= 180 && segmentAngle < 270) {
              boxX = lineStartX - 40
              boxY = lineStartY + 40
            } else {
              boxX = lineStartX + 40
              boxY = lineStartY + 40
            }
            
            return (
              <div key={index} className="absolute" style={{ left: boxX - 60, top: boxY - 30 }}>
                {/* 연결선 */}
                <svg className="absolute" width="100" height="100" style={{ left: -50, top: -50 }}>
                  <line
                    x1="50"
                    y1="50"
                    x2={lineStartX - boxX + 50}
                    y2={lineStartY - boxY + 50}
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth="2"
                  />
                </svg>
                
                {/* 정보 박스 */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 min-w-[120px]">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-lg">{element.icon}</div>
                    <div className="text-sm font-bold text-white">{element.name}</div>
                  </div>
                  <div className="text-xs text-gray-300 leading-tight">
                    {element.description}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 사주 분석 요약 */}
      <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl p-6 border border-blue-400/30">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-blue-300 mb-2">🔮 사주 분석</h3>
          <p className="text-gray-400 italic">생년월일시가 말하는 당신의 운명 이야기</p>
        </div>
        
        {/* 생년월일 감성적 표현 */}
        <div className="text-center mb-6">
          <p className="text-gray-200 text-lg leading-relaxed italic">
            {getBirthDateDescription()}
          </p>
        </div>
        
        {/* 오행 파이 차트 */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-blue-300 mb-4 text-center">🌟 오행 기운 분석</h4>
          {renderPieChart()}
        </div>
        
        {/* 오행 요소별 상세 설명 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ohaengElements.map((element, index) => (
            <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-2xl">{element.icon}</div>
                <div>
                  <h5 className="text-lg font-semibold text-blue-300">{element.name}</h5>
                  <div className="text-sm text-gray-400">{element.description}</div>
                </div>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-300 mb-1">
                  <span>강도</span>
                  <span>{element.strength}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full bg-gradient-to-r ${element.color}`}
                    style={{ width: `${element.strength}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {element.keywords.slice(0, 3).map((keyword, idx) => (
                  <span key={idx} className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs border border-blue-400/30">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 사주 키워드 - 감성적 표현 */}
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl p-8 border border-amber-400/30">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-amber-300 mb-2">✨ 당신의 사주 키워드</h3>
          <p className="text-gray-400 italic">운명이 당신에게 선물한 특별한 기운들</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sajuKeywords.map((keyword, index) => (
            <div 
              key={index} 
              className="group relative p-4 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl border border-amber-400/30 hover:from-amber-500/30 hover:to-orange-500/30 transition-all duration-300 cursor-pointer"
            >
              <div className="text-center">
                <div className="text-2xl mb-2 opacity-80 group-hover:opacity-100 transition-opacity">
                  {['🌟', '💫', '✨', '⭐', '💎', '🎯', '🎨', '🎭'][index % 8]}
                </div>
                <p className="text-amber-300 font-semibold text-sm">{keyword}</p>
              </div>
              
              {/* 호버 시 키워드 설명 */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-3 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10">
                {keyword}의 기운이 당신의 운명을 이끌어갑니다
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 운명의 메시지 */}
      <div className="bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 rounded-2xl p-8 border border-pink-400/30">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-pink-300 mb-4">💝 운명이 전하는 메시지</h3>
          <div className="text-lg text-gray-200 leading-relaxed italic">
            <p className="mb-4">
              당신의 사주는 마치 하늘의 별들이 그린 운명의 지도와 같습니다. 
              각각의 기운들이 조화롭게 어우러져 당신만의 특별한 이야기를 만들어내고 있어요.
            </p>
            <p>
              이제 이 기운들을 잘 활용하여 당신만의 아름다운 운명을 그려나가세요. 
              우주가 당신을 선택한 이유가 있을 테니까요. ✨
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
