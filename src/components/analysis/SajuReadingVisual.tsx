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
      7: '한여름의 에너지가 넘치는 달',
      8: '성숙의 달',
      9: '가을의 지혜가 깃든 달',
      10: '수확의 기쁨이 가득한 달',
      11: '낙엽이 떨어지는 달',
      12: '한 해를 마무리하는 달'
    }
    
    return monthDescriptions[month as keyof typeof monthDescriptions] || '특별한 달'
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* 생년월일 정보 - 감성적 표현 */}
      <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 rounded-2xl p-8 border border-purple-400/30">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-purple-300 mb-2">🌟 당신의 탄생 이야기</h3>
          <p className="text-gray-400 italic">우주가 당신을 선택한 특별한 순간</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="text-4xl mb-3">📅</div>
            <h4 className="text-lg font-semibold text-purple-300 mb-2">탄생의 달</h4>
            <p className="text-gray-200">{getBirthDateDescription()}</p>
            <p className="text-sm text-gray-400 mt-2">{birthDate}</p>
          </div>
          
          <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="text-4xl mb-3">⏰</div>
            <h4 className="text-lg font-semibold text-purple-300 mb-2">운명의 시간</h4>
            <p className="text-gray-200">{birthTime}</p>
            <p className="text-sm text-gray-400 mt-2">우주의 기운이 가장 강했던 순간</p>
          </div>
          
          <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="text-4xl mb-3">📍</div>
            <h4 className="text-lg font-semibold text-purple-300 mb-2">기운의 땅</h4>
            <p className="text-gray-200">{birthPlace}</p>
            <p className="text-sm text-gray-400 mt-2">당신의 뿌리가 자리잡은 곳</p>
          </div>
        </div>
      </div>

      {/* 오행 분석 - 시각적 표현 */}
      <div className="bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 rounded-2xl p-8 border border-green-400/30">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-green-300 mb-2">🌿 오행 기운 분석</h3>
          <p className="text-gray-400 italic">당신 안에 흐르는 우주의 기운들</p>
        </div>
        
        <div className="space-y-6">
          {ohaengElements.map((element, index) => (
            <div key={element.name} className="group">
              <div className="flex items-center gap-4 p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                {/* 오행 아이콘 */}
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-r from-white/20 to-white/10 flex items-center justify-center text-3xl">
                  {element.icon}
                </div>
                
                {/* 오행 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <h4 className="text-xl font-semibold text-green-300">
                      {element.name}
                    </h4>
                    <span className="text-sm text-gray-400 bg-gray-700 px-3 py-1 rounded-full">
                      {element.strength}%
                    </span>
                  </div>
                  
                  <p className="text-gray-200 mb-3">{element.description}</p>
                  
                  {/* 키워드들 */}
                  <div className="flex flex-wrap gap-2">
                    {element.keywords.map((keyword, idx) => (
                      <span 
                        key={idx} 
                        className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-400/30"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* 강도 바 */}
                <div className="flex-shrink-0 w-32">
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className={`h-3 bg-gradient-to-r ${element.color} rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${element.strength}%` }}
                    />
                  </div>
                  <p className="text-center text-xs text-gray-400 mt-1">{element.strength}%</p>
                </div>
              </div>
              
              {/* 호버 시 상세 설명 */}
              <div className="mt-3 p-4 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-sm text-gray-300 leading-relaxed">
                  {element.name === '목(木)' && '목의 기운이 강한 당신은 끊임없이 성장하고 확장하려는 욕구가 강합니다. 새로운 도전을 두려워하지 않고, 창의적인 아이디어로 주변을 놀라게 하는 타입입니다.'}
                  {element.name === '화(火)' && '화의 기운이 넘치는 당신은 타고난 리더십과 카리스마를 가지고 있습니다. 열정적이고 에너지 넘치는 성격으로, 주변 사람들을 끌어들이는 매력이 있습니다.'}
                  {element.name === '토(土)' && '토의 기운으로 안정감이 넘치는 당신은 신뢰할 수 있고 책임감이 강합니다. 균형 잡힌 사고와 조화를 추구하는 성향으로, 주변 사람들에게 안도감을 제공합니다.'}
                  {element.name === '금(金)' && '금의 기운으로 정의감이 강한 당신은 원칙을 중시하고 정직한 성격입니다. 결단력 있고 정리정돈을 잘하며, 공정한 판단으로 존경받는 타입입니다.'}
                  {element.name === '수(水)' && '수의 기운으로 지혜가 깃든 당신은 직관적이고 깊이 있는 사고를 합니다. 유연하고 적응력이 뛰어나며, 상황에 따라 지혜롭게 대처하는 능력이 있습니다.'}
                </p>
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
