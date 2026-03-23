import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

export default function FileDownloadTab() {
  return (
    <div className="flex flex-col items-center gap-8 py-10 max-w-3xl mx-auto">
      {/* 미리보기 썸네일 */}
      <div className="w-48 h-64 bg-gray-100 border border-gray-200 rounded-lg flex flex-col items-center justify-center shadow-sm gap-3">
        <FileText className="w-12 h-12 text-gray-300" />
        <p className="text-xs text-gray-400 font-medium">문서 미리보기</p>
      </div>

      <p className="text-sm text-gray-500 text-center">
        완성된 청구서를 원하는 형식으로 다운로드하세요.
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button variant="outline" className="w-full" onClick={() => alert('준비 중입니다')}>
          PDF 파일 다운로드
        </Button>
        <Button className="w-full" onClick={() => alert('준비 중입니다')}>
          한글(HWP) 파일 다운로드
        </Button>
      </div>
    </div>
  );
}
