import { FileUp, FileQuestion, ShieldCheck, Sparkles } from 'lucide-react';
import NoticeEntryCard from './_components/NoticeEntryCard';

export default function NoticeUploadPage() {
  return (
    <div className="min-h-full bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_55%,#f7faff_100%)] px-4 py-10 md:px-6 xl:px-8">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-12">
        <div className="relative overflow-hidden rounded-[36px] border border-[#dfe8fb] bg-[linear-gradient(180deg,#ffffff_0%,#f5f8ff_100%)] px-8 py-12 md:px-12">
          <div className="absolute -right-16 top-0 h-48 w-48 rounded-full bg-first/8 blur-3xl" />
          <div className="absolute -left-12 bottom-0 h-40 w-40 rounded-full bg-sky-100 blur-3xl" />

          <div className="relative mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-first/8 px-4 py-2 text-sm font-semibold text-first">
              <Sparkles className="h-4 w-4" />
              새 행정심판 시작
            </div>

            <h1 className="mt-5 text-[40px] font-extrabold tracking-[-0.05em] text-slate-900 md:text-[48px]">
              처분서가 있으신가요?
            </h1>

            <p className="mt-4 break-keep text-[18px] leading-8 text-slate-500">
              모든 절차의 기준이 되는 통지서를 올려주시면 더 정확하게 분석을 시작할 수
              있어요. 없으셔도 괜찮습니다. 필요한 내용만 직접 입력하며 진행할 수
              있습니다.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-[0_8px_18px_rgba(15,15,112,0.06)]">
                <ShieldCheck className="h-4 w-4 text-first" />
                업로드 파일은 분석 목적으로만 사용됩니다
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-[0_8px_18px_rgba(15,15,112,0.06)]">
                PDF, JPG, PNG 지원
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <NoticeEntryCard
            title="처분서 업로드"
            description="처분서나 통지서를 올리면 핵심 내용을 먼저 정리한 뒤, 필요한 다음 절차를 순서대로 안내해드립니다."
            helperText="PDF, JPG, PNG / 최대 20MB"
            href="/appeal/analysis"
            ctaLabel="파일 올리고 시작하기"
            icon={FileUp}
            variant="upload"
          />

          <NoticeEntryCard
            title="통지서 없이 진행하기"
            description="처분서가 아직 없거나 바로 업로드하기 어려우시면, 기억나는 내용부터 직접 입력해 계속 진행하실 수 있어요."
            helperText="이후 단계에서 내용을 보완할 수 있어요"
            href="/appeal/claim/incident"
            ctaLabel="직접 입력으로 시작하기"
            icon={FileQuestion}
            variant="manual"
          />
        </div>
      </div>
    </div>
  );
}
