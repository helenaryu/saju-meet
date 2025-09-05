"use client"

import React from 'react'

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

  
  // 생년월일을 감성적으로 표현
  const getBirthDateDescription = () => {
    const date = new Date(birthDate)
    const month = date.getMonth() + 1
    const day = date.getDate()
    
    const monthDescriptions = {
      1: '새로운 시작의 달',
      2: '사랑이 피어나는 달',
      3: '봄의 생명력이 넘치는 달',
      4: '꽃들이 만발하는 달',
      5: '푸른 잎이 무성한 달',
      6: '여름의 열정이 가득한 달',
      7: '태양의 기운이 최고조인 달',
      8: '가을의 서늘함이 느껴지는 달',
      9: '황금빛 가을이 시작되는 달',
      10: '단풍이 물드는 달',
      11: '낙엽이 떨어지는 달',
      12: '겨울의 고요함이 있는 달'
    }
    
    return `${monthDescriptions[month as keyof typeof monthDescriptions]} ${day}일, 당신이 이 세상에 태어난 특별한 순간입니다.`
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
