"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { dummyMatches } from '@/constants/data'

interface Message {
  id: string
  text: string
  sender: 'user' | 'match'
  timestamp: Date
}

export default function ChatPage() {
  const router = useRouter()
  const params = useParams()
  const matchId = params.id as string
  
  const [localUser, setLocalUser] = useState<any>(null)
  const [match, setMatch] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // 페이지 로드 시 사용자 정보 및 매칭 정보 확인
  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 확인
    const savedUser = localStorage.getItem('localUser')
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        setLocalUser(user)
      } catch (error) {
        console.error('저장된 사용자 정보 파싱 오류:', error)
        localStorage.removeItem('localUser')
        router.push('/')
        return
      }
    } else {
      router.push('/')
      return
    }
  }, [router])

  // localUser가 설정된 후 매칭 정보 확인 및 초기 메시지 설정
  useEffect(() => {
    if (!localUser) return

    // 매칭 정보 찾기
    const foundMatch = dummyMatches.find(m => m.id === matchId)
    if (foundMatch) {
      setMatch(foundMatch)
      // 초기 메시지 설정
      setMessages([
        {
          id: '1',
          text: `안녕하세요! ${localUser?.nickname || '사용자'}님과 매칭되어서 정말 기뻐요! 😊`,
          sender: 'match',
          timestamp: new Date()
        },
        {
          id: '2',
          text: 'AI가 분석한 우리의 궁합이 정말 높다고 하네요! 어떤 이야기를 나누고 싶으신가요?',
          sender: 'match',
          timestamp: new Date()
        }
      ])
      setIsLoading(false)
    } else {
      router.push('/ideal-match')
      return
    }
  }, [localUser, matchId, router])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')

    // AI 응답 시뮬레이션 (1-3초 후)
    setTimeout(() => {
      const responses = [
        '정말 흥미로운 이야기네요! 저도 비슷한 경험이 있어요 😊',
        '우와, 그런 일이 있었군요! 더 자세히 들려주세요!',
        '저도 그렇게 생각해요! 우리 정말 잘 맞는 것 같아요 💕',
        '정말 멋진 분이시네요! 더 많은 이야기를 나누고 싶어요',
        '그렇군요! 저도 비슷한 취미가 있어요. 함께 해보고 싶어요!'
      ]
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        sender: 'match',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, aiMessage])
    }, Math.random() * 2000 + 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleBackToMatches = () => {
    router.push('/ideal-match')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-amber-400 mb-4">채팅방 준비 중...</h1>
          <p className="text-white">잠시만 기다려주세요.</p>
        </div>
      </div>
    )
  }

  if (!localUser || !match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-amber-400 mb-4">오류가 발생했습니다</h1>
          <p className="text-white mb-4">사용자 정보 또는 매칭 정보를 찾을 수 없습니다.</p>
          <button
            onClick={() => router.push('/ideal-match')}
            className="bg-amber-400 hover:bg-amber-500 text-black px-6 py-3 rounded-full font-semibold transition-colors"
          >
            이상형 매칭으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col">
      {/* 채팅 헤더 */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToMatches}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ←
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-lg">
                👤
              </div>
              <div>
                <h1 className="text-lg font-bold text-amber-400">{match.name}</h1>
                <div className="text-sm text-gray-400">궁합도 {match.totalCompatibility}%</div>
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            {localUser?.nickname || '사용자'}님
          </div>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-pink-400 to-purple-500 text-white'
                    : 'bg-white/20 text-white border border-white/30'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <div className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-pink-100' : 'text-gray-400'
                }`}>
                  {message.timestamp.toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 메시지 입력 영역 */}
      <div className="bg-white/10 backdrop-blur-sm border-t border-white/20 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              className="flex-1 bg-white/20 border border-white/30 rounded-full px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-full font-semibold transition-colors disabled:cursor-not-allowed"
            >
              전송
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
