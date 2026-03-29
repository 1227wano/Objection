import { Document, Font, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { SupplementDocumentData } from '../../write/_types/document';

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
  title: {
    fontSize: 16,
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: 16,
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
  legalBasis: {
    fontSize: 9,
    marginTop: 12,
    marginBottom: 20,
    paddingLeft: 12,
  },
  signatureBlock: {
    alignItems: 'flex-end',
    gap: 8,
    marginRight: '15%',
  },
  signatureText: {
    fontSize: 10,
  },
  committee: {
    fontSize: 14,
    fontWeight: 700,
    marginTop: 20,
    marginLeft: '10%',
  },
  notice: {
    fontSize: 8,
    color: '#6B7280',
    marginTop: 20,
    marginBottom: 12,
  },
});

interface Props {
  data: SupplementDocumentData;
}

export default function SupplementPdf({ data }: Props) {
  const dateParts = (data.filingDate || '').split('.');
  const hasDate = dateParts.length >= 3;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* 제목 */}
        <Text style={styles.title}>보 충 서 면</Text>

        {/* 접수번호 / 접수일 */}
        <View style={styles.table}>
          <View style={styles.row}>
            <View style={[styles.headerCell, { width: '25%' }]}>
              <Text style={styles.headerCellText}>접수번호</Text>
            </View>
            <View style={[styles.valueCell, { width: '25%' }]} />
            <View style={[styles.headerCell, { width: '25%' }]}>
              <Text style={styles.headerCellText}>접수일</Text>
            </View>
            <View style={[styles.valueCell, { width: '25%' }]} />
          </View>
        </View>

        {/* 본문 테이블 */}
        <View style={[styles.table, { marginTop: 0, borderTopWidth: 0 }]}>
          {/* 사건명 + 사건번호 */}
          <View style={styles.row}>
            <View style={styles.headerCell}>
              <Text style={styles.headerCellText}>사건명</Text>
            </View>
            <View style={[styles.subHeaderCell, { width: '20%' }]}>
              <Text style={styles.valueCellText}>{data.caseName}</Text>
            </View>
            <View style={styles.valueCell}>
              <Text style={styles.valueCellText}>사건번호 : {data.caseNo}</Text>
            </View>
          </View>

          {/* 청구인 성명 */}
          <View style={styles.row}>
            <View style={[styles.headerCell, { justifyContent: 'center' }]}>
              <Text style={styles.headerCellText}>청구인</Text>
            </View>
            <View style={styles.subHeaderCell}>
              <Text style={styles.subHeaderCellText}>성명</Text>
            </View>
            <View style={styles.valueCell}>
              <Text style={styles.valueCellText}>
                {data.claimantName}    (연락처) {data.claimantPhone}
              </Text>
            </View>
          </View>

          {/* 청구인 주소 */}
          <View style={styles.row}>
            <View style={styles.headerCell} />
            <View style={styles.subHeaderCell}>
              <Text style={styles.subHeaderCellText}>주소</Text>
            </View>
            <View style={styles.valueCell}>
              <Text style={styles.valueCellText}>{data.claimantAddress}</Text>
            </View>
          </View>

          {/* 피청구인 */}
          <View style={styles.row}>
            <View style={styles.headerCell}>
              <Text style={styles.headerCellText}>피청구인</Text>
            </View>
            <View style={[styles.valueCell, { flex: 1 }]}>
              <Text style={styles.valueCellText}>{data.respondent}</Text>
            </View>
          </View>

          {/* 구분 */}
          <View style={styles.row}>
            <View style={styles.headerCell}>
              <Text style={styles.headerCellText}>구분</Text>
            </View>
            <View style={[styles.valueCell, { flex: 1 }]}>
              <Text style={styles.valueCellText}>{data.documentType}</Text>
            </View>
          </View>

          {/* 제출 내용 */}
          <View style={styles.lastRow}>
            <View style={[styles.headerCell, { alignSelf: 'stretch', justifyContent: 'flex-start', paddingTop: 8 }]}>
              <Text style={styles.headerCellText}>제출 내용</Text>
            </View>
            <View style={[styles.valueCell, { padding: 10 }]}>
              {data.submissionContent.map((section, idx) => (
                <View key={idx} style={{ marginBottom: idx < data.submissionContent.length - 1 ? 12 : 0 }}>
                  <Text style={{ fontSize: 9, fontWeight: 700, marginBottom: 4 }}>
                    {section.title}
                  </Text>
                  <Text style={{ fontSize: 9, lineHeight: 1.6 }}>{section.content}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 법적 근거 */}
        <Text style={styles.legalBasis}>
          「행정심판법」 제33조제1항에 따라 위와 같이 보충서면을 제출합니다.
        </Text>

        {/* 날짜 + 제출인 */}
        <View style={styles.signatureBlock}>
          {hasDate ? (
            <Text style={styles.signatureText}>
              {dateParts[0].trim()} 년  {dateParts[1].trim()} 월  {dateParts[2].trim()} 일
            </Text>
          ) : (
            <Text style={styles.signatureText}>년  월  일</Text>
          )}
          <Text style={styles.signatureText}>
            제출인    {data.submitterName}    (서명 또는 인)
          </Text>
        </View>

        {/* 수신처 */}
        <Text style={styles.committee}>{data.committee} 귀중</Text>

        {/* 안내 문구 */}
        <Text style={styles.notice}>
          ※ 보충서면은 다른 당사자의 수 만큼 부본을 함께 제출하시기 바랍니다.
        </Text>

        {/* 첨부서류 */}
        <View style={styles.table}>
          <View style={styles.lastRow}>
            <View style={[styles.headerCell, { width: '20%', alignSelf: 'stretch' }]}>
              <Text style={styles.headerCellText}>첨부서류</Text>
            </View>
            <View style={[styles.valueCell, { flex: 1 }]}>
              {data.attachments.map((att, idx) => (
                <Text key={idx} style={[styles.valueCellText, { marginBottom: 2 }]}>
                  {idx + 1}. {att}
                </Text>
              ))}
            </View>
            <View style={[styles.headerCell, { width: '20%', alignSelf: 'stretch' }]}>
              <Text style={styles.headerCellText}>수수료{'\n'}없음</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
