interface StepItem {
  label: string;
  description: string;
}

interface NextStepCard {
  title: string;
  subtitle: string;
  items: StepItem[];
}

const CARDS: NextStepCard[] = [
  {
    title: '결과 수용 및 처분 이행',
    subtitle: '행정심판 위원회의 결정을 받아들이고, 확정된 처분 내용을 이행합니다.',
    items: [
      {
        label: '감경된 처분 확인',
        description: '재결서에 명시된 최종 영업정지 일수 또는 과징금 액수 확인',
      },
      {
        label: '분할 납부 검토',
        description: '과징금일 경우 관할 관청에 분할 납부 또는 기한 연장 신청 가능 여부 문의',
      },
      {
        label: '절차 종료',
        description: '이의 제기 절차가 모두 종료되며, 일상 업무로 복귀',
      },
    ],
  },
  {
    title: '결과 불복 및 행정소송 준비',
    subtitle: '재결 결과에 승복하기 어렵다면 관할 행정법원에 정식으로 소송을 제기할 수 있습니다.',
    items: [
      {
        label: '기한 엄수 (중요)',
        description: '재결서 정본을 송달받은 날로부터 90일 이내에 관할 법원에 소장 제출',
      },
      {
        label: '집행정지 재신청',
        description:
          '기존 집행정지 효력이 소멸하므로, 처분을 다시 막으려면 법원에 별도로 집행정지 신청 필요',
      },
      {
        label: '실익 판단',
        description:
          '행정소송에 소요되는 시간(통상 6개월 이상)과 변호사 선임 비용 등을 고려하여 진행 여부 결정',
      },
    ],
  },
];

const CARD_STYLES = [
  {
    wrapper: 'bg-blue-50 border border-blue-200',
    titleColor: 'text-blue-900',
    subtitleColor: 'text-blue-700',
    dot: 'bg-blue-400',
    labelColor: 'text-blue-900',
    descColor: 'text-blue-700',
    badge: 'bg-blue-500 text-white',
  },
  {
    wrapper: 'bg-amber-50 border border-amber-200',
    titleColor: 'text-amber-900',
    subtitleColor: 'text-amber-700',
    dot: 'bg-amber-400',
    labelColor: 'text-amber-900',
    descColor: 'text-amber-700',
    badge: 'bg-amber-500 text-white',
  },
];

export default function NextStepCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {CARDS.map((card, idx) => {
        const s = CARD_STYLES[idx] ?? CARD_STYLES[1];
        return (
          <div
            key={idx}
            className={`${s.wrapper} rounded-2xl p-6 flex flex-col gap-4 shadow-sm`}
          >
            <div className="flex flex-col gap-2">
              <span className={`self-start text-xs font-bold px-2.5 py-1 rounded-full ${s.badge}`}>
                {idx === 0 ? '수용' : '불복'}
              </span>
              <h3 className={`text-base font-bold leading-snug ${s.titleColor}`}>{card.title}</h3>
              <p className={`text-sm leading-relaxed ${s.subtitleColor}`}>{card.subtitle}</p>
            </div>

            <ul className="flex flex-col gap-3 mt-1">
              {card.items.map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-start gap-3">
                  <span className={`w-2 h-2 rounded-full ${s.dot} mt-1.5 shrink-0`} />
                  <div>
                    <p className={`text-sm font-semibold ${s.labelColor}`}>{item.label}</p>
                    <p className={`text-sm leading-relaxed mt-0.5 ${s.descColor}`}>{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
