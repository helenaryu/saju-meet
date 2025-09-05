import { useEffect, useRef, useState } from "react";

interface OhaengPieChartProps {
  ohaengData?: {
    labels: string[];
    data: number[];
    descriptions: string[];
    personalTraits: string[];
    colors: string[];
    overallInterpretation?: string;
  } | undefined;
}

const OhaengPieChart = ({ ohaengData }: OhaengPieChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // 기본 데이터 (props가 없을 때 사용)
  const defaultLabels = ["목(木)", "화(火)", "토(土)", "금(金)", "수(水)"];
  const defaultData = [25, 15, 30, 10, 20];
  const defaultDescriptions = [
    "자라나는 생명력, 성장성과 끈기를 갖고 있어요.",
    "불 같은 추진력, 열정과 감정의 폭발이 강한 편이에요.",
    "중심을 잡는 안정감, 책임감과 인내심이 돋보입니다.",
    "냉철한 판단력, 이성적이고 분석적인 면이 강합니다.",
    "유연한 사고와 감성, 흐름에 순응하는 스타일이에요."
  ];
  const defaultPersonalTraits = [
    "아이디어를 꾸준히 키워나가는 스타일이에요.",
    "때론 감정에 솔직하게 반응하며 이끌어가는 편이에요.",
    "무게감 있게 중심을 잡고 리더십을 발휘해요.",
    "꼼꼼하고 효율적인 일처리를 잘하는 편이에요.",
    "타인의 감정에 민감하고 배려심이 많아요."
  ];
  const defaultColors = ["#A8D5BA", "#FFB4A2", "#FFEAA7", "#B5B2C2", "#AED9E0"];

  // props가 있으면 사용하고, 없으면 기본값 사용
  const labels = ohaengData?.labels || defaultLabels;
  const data = ohaengData?.data || defaultData;
  const descriptions = ohaengData?.descriptions || defaultDescriptions;
  const personalTraits = ohaengData?.personalTraits || defaultPersonalTraits;
  const colors = ohaengData?.colors || defaultColors;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const total = data.reduce((sum, val) => sum + val, 0);
    let startAngle = -0.5 * Math.PI;
    const centerX = 200;
    const centerY = 200;
    const outerRadius = 140;
    const innerRadius = 80; // 도넛 모양을 위한 내부 반지름

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - centerX;
      const y = e.clientY - rect.top - centerY;
      const distance = Math.sqrt(x * x + y * y);

      if (distance < innerRadius || distance > outerRadius) {
        setHoveredIndex(null);
        return;
      }

      let angle = Math.atan2(y, x);
      if (angle < -0.5 * Math.PI) angle += 2 * Math.PI;
      let accAngle = -0.5 * Math.PI;
      for (let i = 0; i < data.length; i++) {
        const slice = (data[i] / total) * 2 * Math.PI;
        if (angle >= accAngle && angle < accAngle + slice) {
          setHoveredIndex(i);
          break;
        }
        accAngle += slice;
      }
    };

    const handleMouseLeave = () => {
      setHoveredIndex(null);
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - centerX;
      const y = e.clientY - rect.top - centerY;
      const distance = Math.sqrt(x * x + y * y);

      if (distance < innerRadius || distance > outerRadius) return setSelectedIndex(null);

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

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('click', handleClick);

    // Draw donut chart
    data.forEach((value, i) => {
      const sliceAngle = (value / total) * 2 * Math.PI;
      const isHovered = hoveredIndex === i;
      const isSelected = selectedIndex === i;
      
      // 호버 효과를 위한 색상 조정
      let currentColor = colors[i];
      if (isHovered) {
        // 호버 시 밝게
        const color = colors[i];
        const rgb = color.match(/\d+/g);
        if (rgb) {
          const r = Math.min(255, parseInt(rgb[0]) + 30);
          const g = Math.min(255, parseInt(rgb[1]) + 30);
          const b = Math.min(255, parseInt(rgb[2]) + 30);
          currentColor = `rgb(${r}, ${g}, ${b})`;
        }
      }
      
      // 외부 원 그리기
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, outerRadius, startAngle, startAngle + sliceAngle);
      ctx.fillStyle = currentColor;
      ctx.fill();
      
      // 내부 원을 투명하게 만들기 (도넛 모양)
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, innerRadius, startAngle, startAngle + sliceAngle);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      
      // 테두리 그리기 (외부와 내부 모두)
      ctx.strokeStyle = isSelected ? "#10b981" : "#fff";
      ctx.lineWidth = isSelected ? 3 : 2;
      
      // 외부 테두리
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, startAngle + sliceAngle);
      ctx.stroke();
      
      // 내부 테두리
      ctx.beginPath();
      ctx.arc(centerX, centerY, innerRadius, startAngle, startAngle + sliceAngle);
      ctx.stroke();
      
      // 퍼센트와 라벨 텍스트 그리기 (슬라이스가 충분히 클 때만)
      if (sliceAngle > 0.2) { // 최소 각도 체크
        const midAngle = startAngle + sliceAngle / 2;
        const labelRadius = (outerRadius + innerRadius) / 2;
        const labelX = centerX + Math.cos(midAngle) * labelRadius;
        const labelY = centerY + Math.sin(midAngle) * labelRadius;
        
        // 텍스트 배경 그리기
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(labelX - 25, labelY - 15, 50, 30);
        
        // 퍼센트 텍스트
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${value}%`, labelX, labelY - 3);
        
        // 오행 라벨 텍스트
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "10px Arial";
        ctx.fillText(labels[i], labelX, labelY + 8);
      }
      
      startAngle += sliceAngle;
    });

    // 이벤트 리스너 정리 함수 반환
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('click', handleClick);
    };
  }, [data, colors, labels, hoveredIndex, selectedIndex]);

  return (
    <div className="flex flex-col items-center space-y-6">
      <canvas ref={canvasRef} width={400} height={400} className="bg-white/10 rounded-xl shadow-md cursor-pointer border border-white/20" />

      {/* 범례 */}
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {labels.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: colors[i] }}
            />
            <span className="text-sm text-gray-300">{label} ({data[i]}%)</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl mt-4">
        {data.map((value, i) => (
          <div
            key={labels[i]}
            className={`flex flex-col border border-white/20 rounded-lg p-4 bg-white/5 shadow-sm transition-all duration-200 hover:bg-white/10 cursor-pointer ${selectedIndex === i ? 'ring-2 ring-green-400 bg-green-500/20' : ''}`}
            onClick={() => setSelectedIndex(i)}
          >
            <h3 className="font-semibold text-lg text-white">
              {labels[i]} <span className="text-sm text-green-300">({value}%)</span>
            </h3>
            <p className="text-sm text-gray-300 mt-1">🌀 기본 성향: {descriptions[i]}</p>
            <p className="text-sm text-gray-200 mt-1">✨ 당신의 특징: {personalTraits[i]}</p>
          </div>
        ))}
      </div>

    </div>
  );
};

export default OhaengPieChart;