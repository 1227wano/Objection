// @react-pdf/renderer 기반 행정심판 청구서 PDF 컴포넌트
// ⚠️ 한글 렌더링을 위해 public/fonts/ 디렉토리에 한글 폰트 파일을 배치해야 합니다.
//    Pretendard: https://github.com/orioncactus/pretendard (Pretendard-Regular.otf, Pretendard-Bold.otf)
//    또는 Noto Sans KR: https://fonts.google.com/noto/specimen/Noto+Sans+KR

import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import type { ContentJson, PersonalInfo, RepresentativeInfo } from '../../_store/useDocumentStore';

// 한글 폰트 등록
Font.register({
  family: 'KoreanFont',
  fonts: [
    { src: '/fonts/Pretendard-Regular.otf', fontWeight: 400 },
    { src: '/fonts/Pretendard-Bold.otf', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'KoreanFont',
    fontSize: 9,
    color: '#111827',
  },
  header: {
    textAlign: 'center',
    marginBottom: 4,
    fontSize: 8,
    color: '#6B7280',
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 6,
  },
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#111827',
    borderStyle: 'solid',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#111827',
    borderBottomStyle: 'solid',
  },
  lastRow: {
    flexDirection: 'row',
  },
  headerCell: {
    width: '18%',
    padding: 6,
    backgroundColor: '#F3F4F6',
    fontWeight: 700,
    borderRightWidth: 1,
    borderRightColor: '#111827',
    borderRightStyle: 'solid',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCellText: {
    fontSize: 9,
    fontWeight: 700,
    textAlign: 'center',
  },
  subHeaderCell: {
    width: '12%',
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: '#111827',
    borderRightStyle: 'solid',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subHeaderCellText: {
    fontSize: 8,
    textAlign: 'center',
    color: '#6B7280',
  },
  valueCell: {
    flex: 1,
    padding: 6,
  },
  valueCellText: {
    fontSize: 9,
  },
  signature: {
    marginTop: 32,
    alignItems: 'center',
    gap: 8,
  },
  signatureText: {
    fontSize: 10,
    textAlign: 'center',
  },
  // 2페이지
  annex: {
    marginBottom: 20,
  },
  annexTitle: {
    fontSize: 14,
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 8,
  },
  textBox: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'solid',
    borderRadius: 4,
    padding: 10,
    marginBottom: 20,
    minHeight: 80,
  },
  textBoxContent: {
    fontSize: 9,
    lineHeight: 1.6,
  },
});

interface PdfData {
  contentJson: ContentJson;
  personalInfo: PersonalInfo | null;
  representative: RepresentativeInfo | null;
  respondent: string;
  appealCommittee: string;
  dispositionKnownDate: string;
  evidenceList: string[];
  grievanceNotified: boolean;
  publicDefenderRequest: boolean;
  oralHearingRequest: boolean;
  filingDate: string;
}

function checkbox(checked: boolean) {
  return checked ? '[V]' : '[ ]';
}

function committeeCheckboxLine(appealCommittee: string) {
  const isCentral = appealCommittee.includes('중앙');
  const isSido = !isCentral && (appealCommittee.includes('특별시') || appealCommittee.includes('광역시') || appealCommittee.includes('도'));
  return `${checkbox(isCentral)} 중앙  ${checkbox(isSido)} 시도  ${checkbox(!isCentral && !isSido)} 기타`;
}

interface AppealClaimPdfProps {
  data: PdfData;
}

export default function AppealClaimPdf({ data }: AppealClaimPdfProps) {
  const { contentJson, personalInfo, representative, respondent, appealCommittee,
    dispositionKnownDate, evidenceList, grievanceNotified,
    publicDefenderRequest, oralHearingRequest, filingDate } = data;
  const name = personalInfo?.name ?? '';

  return (
    <Document>
      {/* ────────────────── 1페이지: 청구서 본문 ────────────────── */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>■ 행정심판법 시행규칙 [별지 제30호서식]</Text>
        <Text style={styles.title}>행 정 심 판  청 구 서</Text>

        <View style={styles.table}>
          {/* 접수번호 / 접수일 */}
          <View style={styles.row}>
            <View style={styles.headerCell}><Text style={styles.headerCellText}>접수번호</Text></View>
            <View style={styles.valueCell} />
            <View style={[styles.headerCell, { width: '12%' }]}><Text style={styles.headerCellText}>접수일</Text></View>
            <View style={styles.valueCell} />
          </View>

          {/* 청구인 */}
          {[
            { label: '성명', value: personalInfo?.name ?? '' },
            { label: '주소', value: personalInfo?.address ?? '' },
            { label: '주민번호', value: personalInfo?.residentNo ?? '' },
            { label: '전화번호', value: personalInfo?.phone ?? '' },
          ].map((field, i, arr) => (
            <View key={field.label} style={i < arr.length - 1 ? styles.row : styles.row}>
              {i === 0 && (
                <View style={[styles.headerCell, { justifyContent: 'center' }]}>
                  <Text style={styles.headerCellText}>청구인</Text>
                </View>
              )}
              {i > 0 && (
                <View style={styles.headerCell} />
              )}
              <View style={styles.subHeaderCell}>
                <Text style={styles.subHeaderCellText}>{field.label}</Text>
              </View>
              <View style={styles.valueCell}>
                <Text style={styles.valueCellText}>{field.value}</Text>
              </View>
            </View>
          ))}

          {/* 대표자 등 */}
          {[
            { label: '성명', value: representative?.name ?? '해당없음' },
            { label: '주소', value: representative?.address ?? '' },
            { label: '주민번호', value: representative?.residentNo ?? '' },
            { label: '전화번호', value: representative?.phone ?? '' },
          ].map((field, i) => (
            <View key={`rep-${field.label}`} style={styles.row}>
              {i === 0 ? (
                <View style={styles.headerCell}>
                  <Text style={styles.headerCellText}>{'대표자\n(관리인\n등)'}</Text>
                </View>
              ) : (
                <View style={styles.headerCell} />
              )}
              <View style={styles.subHeaderCell}>
                <Text style={styles.subHeaderCellText}>{field.label}</Text>
              </View>
              <View style={styles.valueCell}>
                <Text style={styles.valueCellText}>{field.value}</Text>
              </View>
            </View>
          ))}

          {/* 피청구인 */}
          <View style={styles.row}>
            <View style={styles.headerCell}><Text style={styles.headerCellText}>피청구인</Text></View>
            <View style={{ flex: 1, padding: 6 }}>
              <Text style={styles.valueCellText}>{respondent}</Text>
            </View>
          </View>

          {/* 소관 행정심판위원회 */}
          <View style={styles.row}>
            <View style={styles.headerCell}><Text style={styles.headerCellText}>{'소관\n행정심판\n위원회'}</Text></View>
            <View style={{ flex: 1, padding: 6 }}>
              <Text style={styles.valueCellText}>{committeeCheckboxLine(appealCommittee)}</Text>
              <Text style={[styles.valueCellText, { marginTop: 4, color: '#6B7280' }]}>
                위원회: {appealCommittee}
              </Text>
            </View>
          </View>

          {/* 처분내용 */}
          <View style={styles.row}>
            <View style={styles.headerCell}><Text style={styles.headerCellText}>{'처분내용\n또는\n부작위내용'}</Text></View>
            <View style={{ flex: 1, padding: 6 }}>
              <Text style={styles.valueCellText}>{contentJson.dispositionContent}</Text>
            </View>
          </View>

          {/* 처분이 있음을 안 날 */}
          <View style={styles.row}>
            <View style={styles.headerCell}><Text style={styles.headerCellText}>{'처분이\n있음을\n안 날'}</Text></View>
            <View style={{ flex: 1, padding: 6 }}>
              <Text style={styles.valueCellText}>{dispositionKnownDate}</Text>
            </View>
          </View>

          {/* 청구취지 및 이유 */}
          <View style={styles.row}>
            <View style={styles.headerCell}><Text style={styles.headerCellText}>{'청구취지\n및 이유'}</Text></View>
            <View style={{ flex: 1, padding: 6 }}>
              <Text style={styles.valueCellText}>별지로 작성</Text>
            </View>
          </View>

          {/* 불복절차 고지 */}
          <View style={styles.row}>
            <View style={styles.headerCell}><Text style={styles.headerCellText}>{'처분청의\n불복절차\n고지'}</Text></View>
            <View style={{ flex: 1, padding: 6 }}>
              <Text style={styles.valueCellText}>
                {checkbox(grievanceNotified)} 유    {checkbox(!grievanceNotified)} 무
              </Text>
            </View>
          </View>

          {/* 증거서류 */}
          <View style={styles.row}>
            <View style={styles.headerCell}><Text style={styles.headerCellText}>증거서류</Text></View>
            <View style={{ flex: 1, padding: 6 }}>
              {evidenceList.map((item, i) => (
                <Text key={i} style={[styles.valueCellText, { marginBottom: 2 }]}>
                  {i + 1}. {item}
                </Text>
              ))}
            </View>
          </View>

          {/* 국선대리인 */}
          <View style={styles.row}>
            <View style={styles.headerCell}><Text style={styles.headerCellText}>{'국선대리인\n선임신청'}</Text></View>
            <View style={{ flex: 1, padding: 6 }}>
              <Text style={styles.valueCellText}>
                {checkbox(publicDefenderRequest)} 여    {checkbox(!publicDefenderRequest)} 부
              </Text>
            </View>
          </View>

          {/* 구술심리 */}
          <View style={styles.lastRow}>
            <View style={styles.headerCell}><Text style={styles.headerCellText}>{'구술심리\n신청'}</Text></View>
            <View style={{ flex: 1, padding: 6 }}>
              <Text style={styles.valueCellText}>
                {checkbox(oralHearingRequest)} 여    {checkbox(!oralHearingRequest)} 부
              </Text>
            </View>
          </View>
        </View>

        {/* 서명란 */}
        <View style={styles.signature}>
          <Text style={styles.signatureText}>
            「행정심판법」 제28조 및 같은 법 시행령 제20조에 따라 위와 같이 행정심판을 청구합니다.
          </Text>
          <Text style={[styles.signatureText, { marginTop: 16 }]}>{filingDate}</Text>
          <Text style={[styles.signatureText, { marginTop: 8 }]}>
            청구인    {name}    (서명 또는 인)
          </Text>
          <Text style={[styles.signatureText, { marginTop: 16 }]}>
            {appealCommittee} 귀중
          </Text>
        </View>
      </Page>

      {/* ────────────────── 2페이지: 별지 ────────────────── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.annex}>
          <Text style={styles.annexTitle}>[별지] 청구 취지 및 청구 이유</Text>

          <Text style={styles.sectionLabel}>1. 청구취지</Text>
          <View style={styles.textBox}>
            <Text style={styles.textBoxContent}>{contentJson.claimPurpose}</Text>
          </View>

          <Text style={styles.sectionLabel}>2. 청구원인 (이유)</Text>
          <View style={styles.textBox}>
            <Text style={styles.textBoxContent}>{contentJson.claimReason}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
