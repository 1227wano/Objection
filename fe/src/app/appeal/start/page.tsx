import { FileQuestion } from 'lucide-react';
import NoticeEntryCard from '../notice-upload/_components/NoticeEntryCard';
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
            모든 절차의 기준이 되는 통지서를 올려주시면 정확한 분석을 시작하겠습니다.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <UploadStartCard />

          <NoticeEntryCard
            title="통지서가 없어요"
            description="처분서가 없어도 수동 입력으로 바로 진행할 수 있어요."
            helperText="나중에 내용을 다시 보완할 수 있어요"
            href="/appeal/claim/incident"
            ctaLabel="수동으로 진행하기"
            icon={FileQuestion}
            variant="manual"
          />
        </div>
      </div>
    </div>
  );
}
