// components/OhaengDonutChart.tsx
import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const data = [
  { name: '목(木)', value: 25, color: '#3CB371', desc: '균형 성장화', vibe: '풍요롭고 독오져이쁜 언니지' },
  { name: '화(火)', value: 15, color: '#FF6347', desc: '훼륵 휙 정릴', vibe: '안잘 에너지콱 뿜쁜 언니지' },
  { name: '토(土)', value: 30, color: '#FFA500', desc: '윤장어 정질', vibe: '엄격껍 셀관은흐 질싸얀 언니지' },
  { name: '금(金)', value: 10, color: '#BA55D3', desc: '당진 틀정', vibe: '언근룰 언클링정이 짱욧 에너지' },
  { name: '수(水)', value: 20, color: '#1E90FF', desc: '너지화 당칼', vibe: '어퍽왈 안정틱따쥬 깊은 언니지' },
];

export default function OhaengPieChart() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className="flex flex-col items-center py-10 px-4">
      <h2 className="text-2xl font-bold text-green-500 mb-1">🌿 오행 분석 리포트</h2>
      <p className="text-sm text-gray-200 mb-4">당신의 기질과 성향을 오행으로 분석한 결과</p>

      <div className="relative w-full max-w-xs h-64">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              onClick={(_, index) => setActive(index)}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {data.map((entry, index) => (
          <div
            key={index}
            className="absolute text-white text-xs font-bold"
            style={{
              top: `${50 + 40 * Math.sin((2 * Math.PI * index) / data.length)}%`,
              left: `${50 + 40 * Math.cos((2 * Math.PI * index) / data.length)}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {entry.value}%
          </div>
        ))}

        {active !== null && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full w-72 p-4 bg-white rounded-lg shadow-xl text-sm text-black z-10">
            <h3 className="font-bold text-base mb-1">{data[active].name}</h3>
            <p><strong>기본 성향</strong>: {data[active].desc}</p>
            <p><strong>당신의 특징</strong>: {data[active].vibe}</p>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {data.map((entry, idx) => (
          <div key={idx} className="text-white px-3 py-2 rounded-md text-sm font-semibold" style={{ backgroundColor: entry.color }}>
            {entry.name} <span className="text-xs font-normal">{entry.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
