import { Search, FileEdit, MessageSquare, FilePlus, CheckCircle } from 'lucide-react';

export default function ProcessSection() {
  return (
    <section className="w-full py-20 bg-transparent flex flex-col items-center">
      <h2 className="text-3xl font-bold text-first mb-4">행정심판 5단계 프로세스</h2>
      <p className="text-gray-500 mb-20 px-4 text-center">
        복잡한 절차를 체계적인 5단계 시스템으로 안내합니다.
      </p>

      <div className="relative w-full max-w-6xl mx-auto px-4">
        {/* Dotted line connecting steps */}
        <div className="hidden lg:block absolute top-[40px] left-[10%] right-[10%] border-t-2 border-dashed border-first opacity-30 z-0"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-12 relative z-10">
          {[
            {
              id: 1,
              title: '처분서 수령 및 분석',
              desc: '초기 처분에 근거하여 유효성 판별 분석합니다.',
              icon: <Search className="w-8 h-8 text-white" />,
            },
            {
              id: 2,
              title: '청구서 및 신청서 작성',
              desc: '핵심 쟁점에 부합 하는 사면을 자동 문서화합니다.',
              icon: <FileEdit className="w-8 h-8 text-white" />,
            },
            {
              id: 3,
              title: '답변서 수령 및 분석',
              desc: '행정청의 주장을 논리적으로 분석합니다.',
              icon: <MessageSquare className="w-8 h-8 text-white" />,
            },
            {
              id: 4,
              title: '보충서면 작성 및 제출',
              desc: '재반박을 위한 보충 자료를 생성합니다.',
              icon: <FilePlus className="w-8 h-8 text-white" />,
            },
            {
              id: 5,
              title: '재결서 수령 및 분석',
              desc: '심판 결과를 분석하고 다음 절차를 안내합니다.',
              icon: <CheckCircle className="w-8 h-8 text-white" />,
            },
          ].map((step) => (
            <div key={step.id} className="flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full bg-first flex items-center justify-center shadow-lg">
                  {step.icon}
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white border-2 border-first text-first font-bold flex items-center justify-center text-sm shadow-sm">
                  {step.id}
                </div>
              </div>
              <h3 className="font-bold text-gray-800 mb-2 whitespace-nowrap">{step.title}</h3>
              <p className="text-sm text-gray-500 break-keep leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
