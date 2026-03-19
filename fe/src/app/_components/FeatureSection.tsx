import Image from 'next/image';

export default function FeatureSection() {
  return (
    <section className="w-full bg-gradient-to-b from-[#F8FAFC] to-[#D2D7FF] py-28 flex flex-col gap-32">
      <div className="max-w-6xl mx-auto px-6 w-full flex flex-col gap-32">
        {/* Feature 1 */}
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 flex justify-center md:justify-end w-full">
            <div className="relative w-full max-w-sm lg:max-w-md aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl bg-white border border-gray-100">
              <Image
                src="/쉬운ai작성.png"
                alt="쉬운 AI 작성"
                fill
                className="object-cover object-top"
              />
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-4xl font-bold text-[#0f0f70] mb-5">쉬운 AI 작성</h2>
            <p className="text-xl text-gray-600 leading-relaxed break-keep">
              누구나 쉽게 완성하는 자동 서식 작성 기술로
              <br className="hidden md:block" />
              복잡한 청구서도 몇 분 만에 완성할 수 있습니다.
            </p>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-16">
          <div className="flex-1 flex justify-center md:justify-start w-full">
            <div className="relative w-full max-w-sm lg:max-w-md aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl bg-white border border-gray-100">
              <Image
                src="/문서분석.png"
                alt="문서 분석"
                fill
                className="object-cover object-top"
              />
            </div>
          </div>
          <div className="flex-1 text-center md:text-right">
            <h2 className="text-4xl font-bold text-[#0f0f70] mb-5">문서 분석</h2>
            <p className="text-xl text-gray-600 leading-relaxed break-keep">
              복잡한 행정 처분서를 AI가 즉시 분석하여
              <br className="hidden md:block" />
              핵심 쟁점과 대응 방안을 명확하게 제시합니다.
            </p>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 flex justify-center md:justify-end w-full">
            <div className="relative w-full max-w-sm lg:max-w-md aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl bg-white border border-gray-100">
              <Image
                src="/법률안내.png"
                alt="법률 안내"
                fill
                className="object-cover object-top"
              />
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-4xl font-bold text-[#0f0f70] mb-5">법률 안내</h2>
            <p className="text-xl text-gray-600 leading-relaxed tracking-tight break-keep">
              개별 상황에 딱 맞는 맞춤형 법률 가이드와 유사 판례 데이터를<br className="hidden md:block" />
              당신의 상황에 딱 맞게 실시간으로 제공합니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
