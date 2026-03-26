'use client';

import { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import SectionHeader from '../../_components/SectionHeader';
import { Button } from '@/components/ui/button';
import DocumentEditor from './_components/DocumentEditor';
import RightSidebar from './_components/RightSidebar';
import SavingModal from './_components/SavingModal';
import { DocumentData } from './_types/document';
import { apiClient } from '@/lib/api-client';
import { useDocumentStore } from '../_store/useDocumentStore';

const analysisNo = 1;

// API committeeType 문자열 → 폼 CommitteeType 매핑
function mapCommitteeType(value: string): '중앙' | '시도' | '기타' {
  if (value.includes('중앙')) return '중앙';
  if (value.includes('시도')) return '시도';
  return '기타';
}

const EMPTY_DOCUMENT_DATA: DocumentData = {
  caseNo: '',
  caseTitle: '',
  claimant: { name: '', address: '', residentNo: '', phone: '' },
  representative: { type: null, name: '', address: '', residentNo: '', phone: '' },
  respondent: '',
  appealCommitteeType: '기타',
  appealCommittee: '',
  dispositionContent: '',
  dispositionKnownDate: '',
  claimPurpose: '',
  claimReason: { background: '', arguments: [] },
  grievanceNotified: false,
  grievanceContent: '',
  evidenceList: [],
  publicDefenderRequest: false,
  oralHearingRequest: false,
  filingDate: '',
  dispositionDate: '',
};

export default function WritePage() {
  const router = useRouter();
  const { setDocumentData } = useDocumentStore();
  const [saving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const methods = useForm<DocumentData>({
    defaultValues: EMPTY_DOCUMENT_DATA,
  });

  // 마운트 시 생성 문서 조회
  useEffect(() => {
    const loadDocument = async () => {
      try {
        const res = await apiClient.get<{
          status: string;
          data: {
            contentJson: {
              committeeType: string;
              dispositionContent: string;
              claimPurpose: string;
              claimReason: string;
            };
          };
        }>(`/analysis/${analysisNo}/documents`);

        if (res.status === 'SUCCESS' && res.data?.contentJson) {
          const { committeeType, dispositionContent, claimPurpose, claimReason } =
            res.data.contentJson;
          methods.reset({
            ...EMPTY_DOCUMENT_DATA,
            appealCommitteeType: mapCommitteeType(committeeType),
            dispositionContent,
            claimPurpose,
            claimReason: {
              background: claimReason,
              arguments: [],
            },
          });
        } else {
          setLoadError(true);
        }
      } catch {
        setLoadError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadDocument();
  }, [methods]);

  if (isLoading) {
    return (
      <div className="flex w-full min-h-screen items-center justify-center">
        <p className="text-sm text-[#6B7280]">문서를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex w-full min-h-screen items-center justify-center flex-col gap-4">
        <p className="text-sm text-[#6B7280]">문서를 불러오지 못했습니다.</p>
        <Button onClick={() => router.back()}>이전으로 돌아가기</Button>
      </div>
    );
  }

  const onSubmit = async (data: DocumentData) => {
    setSaving(true);

    // claimReason: background + arguments 를 하나의 문자열로 조합
    const claimReasonText = [
      data.claimReason.background,
      ...data.claimReason.arguments.map((a, i) => `${i + 1}. ${a.title}\n${a.content}`),
    ]
      .filter(Boolean)
      .join('\n\n');

    const contentJson = {
      committeeType: data.appealCommitteeType,
      dispositionContent: data.dispositionContent,
      claimPurpose: data.claimPurpose,
      claimReason: claimReasonText,
    };

    try {
      // contentJson만 서버에 저장 (민감정보 제외)
      await apiClient.patch(`/analysis/${analysisNo}/documents`, {
        documentType: 'APPEAL_CLAIM',
        contentJson,
      });

      // zustand store에 전체 데이터 저장 (민감정보 포함)
      setDocumentData({
        contentJson,
        personalInfo: {
          name: data.claimant.name,
          address: data.claimant.address,
          residentNo: data.claimant.residentNo,
          phone: data.claimant.phone,
        },
        representative: {
          type: data.representative.type,
          name: data.representative.name,
          address: data.representative.address,
          residentNo: data.representative.residentNo,
          phone: data.representative.phone,
        },
        respondent: data.respondent,
        appealCommittee: data.appealCommittee,
        dispositionKnownDate: data.dispositionKnownDate,
        evidenceList: data.evidenceList,
        grievanceNotified: data.grievanceNotified,
        publicDefenderRequest: data.publicDefenderRequest,
        oralHearingRequest: data.oralHearingRequest,
        filingDate: data.filingDate,
      });
      console.log(data);
      router.push('/appeal/claim/complete');
    } catch {
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="flex w-full min-h-screen animate-in fade-in duration-500"
      >
        {/* 중앙 편집기 영역 */}
        <div className="flex-1 flex justify-center py-12 md:py-16">
          <div className="w-full max-w-4xl px-8 flex flex-col">
            <SectionHeader
              title="행정심판 청구서 초안이 완성되었습니다."
              description="제출 전 사실관계가 맞는지 꼼꼼히 확인하고, 수정이 필요한 부분을 직접 편집해 주세요"
              descriptionColor="text-indigo-500"
            />

            <div className="mt-8">
              <DocumentEditor />
            </div>

            <div className="flex justify-end pt-10 pb-10">
              <Button type="submit" disabled={saving}>
                수정 완료
              </Button>
            </div>
          </div>
        </div>

        {/* 오른쪽 사이드바 */}
        <RightSidebar legalIssues={[]} />
      </form>

      <SavingModal isOpen={saving} />
    </FormProvider>
  );
}
