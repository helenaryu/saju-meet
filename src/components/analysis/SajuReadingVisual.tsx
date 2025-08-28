"use client"

import React, { useRef, useState, useEffect } from 'react'

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
  
  // Move hooks to top level
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

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
  
  // Calculate total for percentage calculations
  const total = ohaengElements.reduce((sum, element) => sum + element.strength, 0);
  
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

  // Canvas 기반 인터랙티브 파이 차트 렌더링
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = ohaengElements.map(element => element.strength);
    const colors = ['#4CAF50', '#F44336', '#FF9800', '#FFC107', '#2196F3']; // 전통적인 오행 색상

    // Canvas 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 140;
    let startAngle = -0.5 * Math.PI;

    // 파이 차트 그리기
    data.forEach((value, i) => {
      const sliceAngle = (value / total) * 2 * Math.PI;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.fillStyle = colors[i];
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 퍼센트 텍스트 그리기
      const textAngle = startAngle + sliceAngle / 2;
      const textRadius = radius * 0.7;
      const textX = centerX + textRadius * Math.cos(textAngle);
      const textY = centerY + textRadius * Math.sin(textAngle);

      ctx.save();
      ctx.translate(textX, textY);
      ctx.rotate(textAngle + Math.PI / 2);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 2;
      ctx.fillText(`${Math.round((value / total) * 100)}%`, 0, 0);
      ctx.restore();

      startAngle += sliceAngle;
    });

    // 중앙 텍스트 그리기
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('오행', centerX, centerY - 10);
    ctx.font = '14px Arial';
    ctx.fillStyle = '#ccc';
    ctx.fillText('분석', centerX, centerY + 15);

    // 클릭 이벤트 처리
    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - centerX;
      const y = e.clientY - rect.top - centerY;
      const distance = Math.sqrt(x * x + y * y);

      if (distance > radius) {
        setSelectedIndex(null);
        return;
      }

      let angle = Math.atan2(y, x);
      if (angle < -0.5 * Math.PI) angle += 2 * Math.PI;
      
      let accAngle = -0.5 * Math.PI;
      for (let i = 0; i < data.length; i++) {
        const slice = (data[i] / total) * 2 * Math.PI;
        if (angle >= accAngle && angle < accAngle + slice) {
          setSelectedIndex(i);
          break;
        }
        accAngle += slice;
      }
    };

    canvas.addEventListener('click', handleClick);

         return () => {
       canvas.removeEventListener('click', handleClick);
     };
   }, [ohaengElements, total]);

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
        <div className="mb-8">
          <h4 className="text-xl font-semibold text-blue-300 mb-6 text-center">🌟 오행 기운 분석</h4>
          <div className="flex flex-col items-center space-y-6">
            <canvas 
              ref={canvasRef} 
              width={400} 
              height={400} 
              className="bg-transparent rounded-xl cursor-pointer shadow-lg"
            />
            
            {/* 선택된 요소 상세 정보 */}
            {selectedIndex !== null && (
              <div className="w-full max-w-md p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 animate-fade-in">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-2xl">{ohaengElements[selectedIndex].icon}</div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{ohaengElements[selectedIndex].name}</h3>
                    <p className="text-sm text-gray-300">{Math.round((ohaengElements[selectedIndex].strength / total) * 100)}%</p>
                  </div>
                </div>
                <p className="text-sm text-gray-200 leading-relaxed mb-3">
                  {ohaengElements[selectedIndex].description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {ohaengElements[selectedIndex].keywords.slice(0, 3).map((keyword, idx) => (
                    <span key={idx} className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs border border-blue-400/30">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
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
