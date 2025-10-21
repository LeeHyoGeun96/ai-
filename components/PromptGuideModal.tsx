
import React from 'react';

interface PromptGuideModalProps {
  onClose: () => void;
}

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-2xl font-semibold text-cyan-400 mb-4 border-b border-gray-700 pb-2">{children}</h3>
);

const SubTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h4 className="text-lg font-semibold text-gray-200 mt-4 mb-2">{children}</h4>
);

const Code: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <code className="bg-gray-700 text-yellow-300 p-1 rounded text-sm font-mono">{children}</code>
);

const PromptGuideModal: React.FC<PromptGuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 lg:p-8 relative text-gray-300 scrollbar-thin"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-3xl font-bold text-cyan-300 mb-6">Nano Banana (Gemini 2.5 Flash Image) 프롬프트 가이드</h2>
        
        <section className="mb-8">
          <SectionTitle>1. 나노바나나 소개 및 기본 사용법</SectionTitle>
          <p className="mb-4">
            나노바나나는 구글의 제미니 2.5 플래시 이미지 생성 모델을 기반으로 한 AI 도구로, 텍스트 프롬프트를 통해 이미지 생성 및 편집을 지원합니다. 별명 '나노 바나나'로 불리며, 대화형 편집, 이미지 합성, 스타일 전환 등 다기능성을 자랑합니다. 사용자 친화적인 인터페이스로 초보자도 쉽게 접근할 수 있습니다.
          </p>
          <SubTitle>기본 사용법:</SubTitle>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li>텍스트 프롬프트를 입력하고, 필요 시 참조 이미지를 업로드합니다.</li>
            <li>생성된 이미지를 확인한 후, 후속 프롬프트로 수정(예: "배경 변경")을 지시합니다.</li>
            <li>프롬프트 길이는 100단어 이내로 유지해 모호성을 줄입니다.</li>
            <li>멀티턴 편집을 통해 복잡한 작업을 단계적으로 진행합니다.</li>
          </ul>
        </section>

        <section className="mb-8">
          <SectionTitle>2. 프롬프트 작성 기본 원칙 및 구성 요소</SectionTitle>
          <p className="mb-4">
            나노바나나 프롬프트는 구조화된 접근으로 최적의 결과를 도출합니다. 다음 요소를 순서대로 포함하는 것을 권장합니다.
          </p>
          <div className="bg-gray-900 p-4 rounded-md">
            <ol className="space-y-3">
              {[
                { title: '행동/목표', desc: 'AI의 작업을 명확히 지시', ex: '이 이미지를 3D 모델로 변환' },
                { title: '대상', desc: '주체의 세부 사항', ex: '나이, 성별, 수, 물건 등' },
                { title: '속성', desc: '시각적 특징', ex: '의상, 표정, 색상, 소품' },
                { title: '환경 및 조명', desc: '배경, 빛 방향, 분위기', ex: '창문 자연광, 35mm 렌즈' },
                { title: '스타일 및 마무리', desc: '예술 스타일 또는 후처리', ex: '하이퍼리얼, 누아르, 필름 그레인' },
                { title: '제약 조건', desc: '피할 요소', ex: '로고 없음, 보정 최소화' },
                { title: '일관성 토큰 (옵션)', desc: '반복 작업 시 동일 인물 유지', ex: '루나 스카프 태그' },
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-cyan-400 font-bold mr-3">{index + 1}.</span>
                  <div>
                    <strong className="text-green-400">{item.title}:</strong> {item.desc} (예: <span className="italic text-gray-400">"{item.ex}"</span>)
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <p className="mt-4">이 구조는 모호성을 줄이고, 참조 앵커(구체적 용어)와 미시적 제약(변경 금지 사항)을 추가해 신뢰도를 높입니다.</p>
        </section>

        <section className="mb-8">
          <SectionTitle>3. 검증된 주요 프롬프트 예시</SectionTitle>
          <div className="space-y-6">
            <div>
              <SubTitle>이미지 편집 및 합성</SubTitle>
              <ul className="space-y-2 pl-4">
                <li><strong className="text-amber-400 w-24 inline-block">인물 제거:</strong> <Code>In this picture, remove the person on the left while keeping the background intact.</Code></li>
                <li><strong className="text-amber-400 w-24 inline-block">배경 변경:</strong> <Code>Change the background of this image to a beach at sunset, maintaining the subject's pose.</Code></li>
                <li><strong className="text-amber-400 w-24 inline-block">3D 모델 생성:</strong> <Code>Convert this photo to a 3D model on a desk with CAD interface in the background.</Code></li>
              </ul>
            </div>
            <div>
              <SubTitle>캐릭터 및 피규어</SubTitle>
              <ul className="space-y-2 pl-4">
                <li><strong className="text-amber-400 w-24 inline-block">피규어 제작:</strong> <Code>Draw a prospective model of the character in the picture, commercialized as a 1/7 scale figure.</Code></li>
                <li><strong className="text-amber-400 w-24 inline-block">봉제 인형화:</strong> <Code>A soft, high-quality plush toy of [CHARACTER], with oversized head, small body, fuzzy fabric.</Code></li>
                <li><strong className="text-amber-400 w-24 inline-block">해부학 일러스트:</strong> <Code>Draw a bilaterally symmetrical frontal anatomical illustration of [Character], infographic style.</Code></li>
              </ul>
            </div>
            <div>
              <SubTitle>사진 스타일 및 초상화</SubTitle>
              <ul className="space-y-2 pl-4">
                <li><strong className="text-amber-400 w-28 inline-block">아이폰 셀카:</strong> <Code>An ordinary iPhone selfie with awkward angle, slight motion blur, taken at night.</Code></li>
                <li><strong className="text-amber-400 w-28 inline-block">누아르 만화 패널:</strong> <Code>High-contrast black-and-white ink noir style comic panel, detective in trench coat under flickering streetlight.</Code></li>
                <li><strong className="text-amber-400 w-28 inline-block">스튜디오 지브리:</strong> <Code>Studio Ghibli style portrait, pastel colors, dreamy animation.</Code></li>
              </ul>
            </div>
            <div>
              <SubTitle>차트 및 그래픽</SubTitle>
              <ul className="space-y-2 pl-4">
                <li><strong className="text-amber-400 w-24 inline-block">SWOT 분석:</strong> <Code>Create a professional SWOT analysis chart using this logo, clean and corporate design.</Code></li>
                <li><strong className="text-amber-400 w-24 inline-block">밈 생성:</strong> <Code>Add bold white caption text to make this a viral meme, humorous style.</Code></li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <SectionTitle>4. 실사 피부 프롬프트</SectionTitle>
          <p className="mb-4">사실적이고 미보정된 인물 클로즈업을 위한 전용 프롬프트입니다. 피부 디테일을 강조해 'raw beauty'를 구현합니다.</p>
          <div className="bg-gray-900 p-4 rounded-md">
            <SubTitle>Anatomy Breakdown (분석)</SubTitle>
            <ul className="space-y-1 mb-4">
                <li><strong className="text-green-400 w-32 inline-block">구도:</strong> <Code>ultra close-up, half face portrait</Code> (극단 근접 + 얼굴 절반 구도)</li>
                <li><strong className="text-green-400 w-32 inline-block">질감:</strong> <Code>every pore visible, natural skin oils</Code> (모공과 피부 유분 강조)</li>
                <li><strong className="text-green-400 w-32 inline-block">디테일:</strong> <Code>fine facial hair, unretouched</Code> (솜털 표현 + 무보정 느낌)</li>
                <li><strong className="text-green-400 w-32 inline-block">장비:</strong> <Code>Nikon Z9, 105mm Macro</Code> (실제 카메라로 신뢰도 상승)</li>
                <li><strong className="text-green-400 w-32 inline-block">조명:</strong> <Code>window light, documentary</Code> (자연광으로 진정성 확보)</li>
            </ul>
            <SubTitle>전체 프롬프트 예시</SubTitle>
            <p className="bg-gray-700 p-3 rounded font-mono text-sm leading-relaxed">
                ultra close-up, half face portrait, every pore visible, natural skin oils, fine facial hair, unretouched, shot on Nikon Z9, NIKKOR Z MC 105mm f/2.8 VR S, window light, raw beauty documentation
            </p>
            <SubTitle>DOs & DON'Ts</SubTitle>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-green-900 bg-opacity-30 p-3 rounded-lg">
                    <h5 className="text-green-400 font-bold mb-2">DOs (권장)</h5>
                    <ul className="list-disc list-inside space-y-1">
                        <li>구체적 장비명 (예: <Code>Nikon Z9</Code>)</li>
                        <li><Code>visible pores</Code> 명시</li>
                        <li><Code>unretouched</Code> 추가</li>
                        <li>자연광 소스 (예: <Code>window light</Code>)</li>
                    </ul>
                </div>
                <div className="bg-red-900 bg-opacity-30 p-3 rounded-lg">
                    <h5 className="text-red-400 font-bold mb-2">DON'Ts (비권장)</h5>
                    <ul className="list-disc list-inside space-y-1">
                        <li><Code>perfect skin</Code></li>
                        <li><Code>smooth</Code> 같은 단어</li>
                        <li><Code>professional</Code> 표현</li>
                        <li>추상적 형용사</li>
                    </ul>
                </div>
            </div>
          </div>
        </section>
        
        <section className="mb-8">
            <SectionTitle>5. 고급 프롬프트 작성 팁</SectionTitle>
            <ul className="list-disc list-inside space-y-2 pl-4">
                <li><strong className="text-green-400">참조 앵커 활용:</strong> 구체적 용어(<Code>렘브란트 조명</Code>, <Code>f/2.8 렌즈</Code>)로 모호성 제거.</li>
                <li><strong className="text-green-400">반복 루프:</strong> 첫 출력 평가 후 교정 (예: "이전 결과 유지, 눈썹만 두껍게").</li>
                <li><strong className="text-green-400">편집 체인:</strong> 복잡 작업을 분할 (배경 변경 → 의상 업데이트 → 색상 보정).</li>
                <li><strong className="text-green-400">부정적 프롬프트:</strong> 원치 않는 요소 암시 (예: "변경하지 마세요"로 일관성 유지).</li>
                <li><strong className="text-green-400">색상/스타일 변형:</strong> 단어 교체 (<Code>생생한 → 차분한</Code>)로 다중 버전 생성.</li>
                 <li><strong className="text-green-400">멀티 이미지 융합:</strong> 여러 참조 이미지 결합 (예: "image1 스타일 + image2 색상").</li>
            </ul>
        </section>

        <section>
            <SectionTitle>6. 주의점 및 제약 조건</SectionTitle>
            <ul className="list-disc list-inside space-y-2 pl-4 text-amber-300">
                <li><strong className="text-white">저작권 준수:</strong> 참조 이미지 사용 시 무단 복제를 피하세요.</li>
                <li><strong className="text-white">콘텐츠 제한:</strong> 부적절하거나 민감한 주제는 AI가 자동 필터링합니다.</li>
                <li><strong className="text-white">프롬프트 모호성:</strong> 문법 오류나 과도한 길이는 해석 실패를 초래할 수 있습니다.</li>
                <li><strong className="text-white">일관성 문제:</strong> 여러 씬에서 동일 인물을 유지하려면 캐릭터 고정 기능을 사용하세요.</li>
                <li><strong className="text-white">브랜드 사용:</strong> 로고나 상표는 권한을 확인하고 사용하세요.</li>
            </ul>
        </section>

      </div>
    </div>
  );
};

export default PromptGuideModal;
