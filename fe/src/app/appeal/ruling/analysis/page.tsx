import Link from 'next/link';
import { ArrowRight, FileSearch } from 'lucide-react';

export default function RulingAnalysisPage() {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-first/10 text-first">
        <FileSearch className="h-10 w-10" />
      </div>
      <h1 className="mt-8 text-[34px] font-extrabold tracking-[-0.04em] text-slate-950">
        재결서 분석 화면을 준비하고 있어요
      </h1>
      <p className="mt-4 max-w-2xl break-keep text-[17px] leading-8 text-slate-500">
        재결서 등록 흐름은 연결되었고, 다음 단계인 분석 결과 화면은 이어서 확장할 수 있도록
        자리만 먼저 준비해 두었습니다.
      </p>
      <Link
        href="/appeal/start"
        className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-first px-6 py-4 text-base font-semibold text-white shadow-[0_18px_40px_rgba(15,15,112,0.18)] transition hover:bg-first/90"
      >
        처음으로 돌아가기
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
