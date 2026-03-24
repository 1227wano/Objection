import { FileQuestion } from 'lucide-react';
import NoticeEntryCard from './_components/NoticeEntryCard';
import UploadStartCard from './_components/UploadStartCard';

export default function AppealStartPage() {
  return (
    <div className="min-h-full bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_55%,#f7faff_100%)] px-4 py-16 md:px-6 xl:px-8">
      <div className="mx-auto flex w-full max-w-[980px] flex-col">
        <div className="text-center">
          <h1 className="text-[40px] font-extrabold tracking-[-0.05em] text-slate-900 md:text-[46px]">
            처분서가 있으신가요?
          </h1>
          <p className="mt-4 text-[18px] leading-8 text-first/80">
            업로드하셔도 되고, 없어도 바로 설문으로 넘어가서 행정심판 준비를 시작할 수 있어요.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <UploadStartCard />

          <NoticeEntryCard
            title="처분서가 없어요"
            description="처분서를 아직 받지 못했거나 바로 입력부터 시작하고 싶다면 빈 설문으로 이어집니다."
            helperText="필요한 정보는 다음 단계에서 직접 차근차근 작성할 수 있어요."
            href="/appeal/claim/survey"
            ctaLabel="설문으로 진행하기"
            icon={FileQuestion}
            variant="manual"
          />
        </div>
      </div>
    </div>
  );
}
