package com.objection.gendocument.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.objection.cases.entity.Case;
import com.objection.common.exception.BusinessException;
import com.objection.common.exception.ErrorCode;
import com.objection.govdocument.entity.GovDocument;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.Map;

@Service
public class PdfService {

    private static final String FONT_PATH = "/fonts/NanumGothic.ttf";
    private final ObjectMapper objectMapper = new ObjectMapper();

    public byte[] generatePdf(String documentType, Map<String, Object> contentJson,
                              Case foundCase, GovDocument govDoc) {
        if ("APPEAL_CLAIM".equals(documentType)) {
            return generateAppealClaim(contentJson, foundCase, govDoc);
        } else {
            return generateSupplementStatement(contentJson, foundCase);
        }
    }

    private byte[] generateAppealClaim(Map<String, Object> contentJson, Case foundCase, GovDocument govDoc) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 50, 50, 60, 60);
            PdfWriter.getInstance(document, baos);
            document.open();

            BaseFont baseFont = BaseFont.createFont(
                    PdfService.class.getResource(FONT_PATH).toString(),
                    BaseFont.IDENTITY_H,
                    BaseFont.EMBEDDED
            );
            Font titleFont = new Font(baseFont, 18, Font.BOLD);
            Font boldFont = new Font(baseFont, 9, Font.BOLD);
            Font normalFont = new Font(baseFont, 9, Font.NORMAL);
            Font smallFont = new Font(baseFont, 8, Font.NORMAL);

            Paragraph title = new Paragraph("행 정 심 판  청 구 서", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(5f);
            document.add(title);

            Paragraph rightAlign = new Paragraph("(앞쪽)", smallFont);
            rightAlign.setAlignment(Element.ALIGN_RIGHT);
            document.add(rightAlign);

            PdfPTable headerTable = new PdfPTable(new float[]{30f, 50f, 20f});
            headerTable.setWidthPercentage(100);
            addGrayCell(headerTable, "접수번호", boldFont);
            addGrayCell(headerTable, "접수일", boldFont);
            addGrayCell(headerTable, "", boldFont);
            document.add(headerTable);

            PdfPTable mainTable = new PdfPTable(new float[]{20f, 20f, 60f});
            mainTable.setWidthPercentage(100);

            addMergedLeftCell(mainTable, "청구인", boldFont, 4);

            addLabelCell(mainTable, "성명", normalFont);
            addValueCell(mainTable, foundCase.getClaimant() != null ? foundCase.getClaimant() : "", normalFont);

            addLabelCell(mainTable, "주소", normalFont);
            addValueCell(mainTable, getString(contentJson, "claimantAddress"), normalFont);

            addLabelCell(mainTable, "주민등록번호(외국인등록번호)", normalFont);
            addValueCell(mainTable, getString(contentJson, "claimantResidentNo"), normalFont);

            addLabelCell(mainTable, "전화번호", normalFont);
            addValueCell(mainTable, getString(contentJson, "claimantPhone"), normalFont);

            addFullRowCell(mainTable, "피청구인",
                    foundCase.getAgencyName() != null ? foundCase.getAgencyName() : "", boldFont, normalFont);

            String committeeType = getString(contentJson, "committeeType");
            String committeeText = buildCommitteeText(committeeType);
            addFullRowCell(mainTable, "소관\n행정심판위원회", committeeText, boldFont, normalFont);

            addFullRowCell(mainTable, "처분 내용 또는\n부작위 내용",
                    getString(contentJson, "dispositionContent"), boldFont, normalFont);

            String awareDate = foundCase.getAwareDate() != null ? foundCase.getAwareDate().toString() : "";
            addFullRowCell(mainTable, "처분이 있음을\n안 날", awareDate, boldFont, normalFont);

            String claimContent = "【청구취지】\n" + getString(contentJson, "claimPurpose")
                    + "\n\n【청구이유】\n" + getString(contentJson, "claimReason");
            addFullRowCell(mainTable, "청구 취지 및\n청구 이유", claimContent, boldFont, normalFont);

            String informYn = "[ ] 유    [✓] 무";
            String informContent = "";
            if (govDoc != null && govDoc.getParsedJson() != null) {
                try {
                    Map<String, Object> parsedFields = objectMapper.readValue(
                            govDoc.getParsedJson(),
                            objectMapper.getTypeFactory().constructMapType(Map.class, String.class, Object.class)
                    );
                    Object informVal = parsedFields.get("Inform");
                    if (Boolean.TRUE.equals(informVal) || "true".equals(String.valueOf(informVal))) {
                        informYn = "[✓] 유    [ ] 무";
                    }
                    Object informContentVal = parsedFields.get("InformContent");
                    if (informContentVal != null) informContent = informContentVal.toString();
                } catch (Exception ignored) {}
            }
            addFullRowCell(mainTable, "처분청의\n불복절차 고지 유무", informYn, boldFont, normalFont);
            addFullRowCell(mainTable, "처분청의\n불복절차 고지 내용", informContent, boldFont, normalFont);

            Boolean publicDefender = Boolean.TRUE.equals(contentJson.get("publicDefenderRequest"));
            addFullRowCell(mainTable, "국선대리인\n선임 신청 여부",
                    publicDefender ? "[✓] 여    [ ] 부" : "[ ] 여    [✓] 부", boldFont, normalFont);

            Boolean oralHearing = Boolean.TRUE.equals(contentJson.get("oralHearingRequest"));
            addFullRowCell(mainTable, "구술심리 신청\n여부",
                    oralHearing ? "[✓] 여    [ ] 부" : "[ ] 여    [✓] 부", boldFont, normalFont);

            document.add(mainTable);

            LocalDate today = LocalDate.now();
            Paragraph footer = new Paragraph(
                    "「행정심판법」 제28조 및 같은 법 시행령 제20조에 따라 위와 같이 행정심판을 청구합니다.\n\n"
                            + today.getYear() + "년    " + today.getMonthValue() + "월    " + today.getDayOfMonth() + "일\n\n"
                            + "                                                         청구인                    (서명 또는 인)\n\n"
                            + "○○행정심판위원회  귀중", normalFont);
            footer.setSpacingBefore(10f);
            document.add(footer);

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new BusinessException(ErrorCode.PDF_CONVERT_FAILED);
        }
    }

    private byte[] generateSupplementStatement(Map<String, Object> contentJson, Case foundCase) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 50, 50, 60, 60);
            PdfWriter.getInstance(document, baos);
            document.open();

            BaseFont baseFont = BaseFont.createFont(
                    PdfService.class.getResource(FONT_PATH).toString(),
                    BaseFont.IDENTITY_H,
                    BaseFont.EMBEDDED
            );
            Font titleFont = new Font(baseFont, 18, Font.BOLD);
            Font boldFont = new Font(baseFont, 9, Font.BOLD);
            Font normalFont = new Font(baseFont, 9, Font.NORMAL);

            Paragraph title = new Paragraph("보  충  서  면", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(5f);
            document.add(title);

            PdfPTable headerTable = new PdfPTable(new float[]{30f, 50f, 20f});
            headerTable.setWidthPercentage(100);
            addGrayCell(headerTable, "접수번호", boldFont);
            addGrayCell(headerTable, "접수일", boldFont);
            addGrayCell(headerTable, "", boldFont);
            document.add(headerTable);

            PdfPTable mainTable = new PdfPTable(new float[]{20f, 80f});
            mainTable.setWidthPercentage(100);

            addFullRowCell(mainTable, "사건명", "사건번호 :", boldFont, normalFont);

            PdfPTable claimantTable = new PdfPTable(new float[]{20f, 20f, 60f});
            claimantTable.setWidthPercentage(100);
            addMergedLeftCell(claimantTable, "청구인", boldFont, 2);
            addLabelCell(claimantTable, "성명", normalFont);
            addValueCell(claimantTable,
                    (foundCase.getClaimant() != null ? foundCase.getClaimant() : "") + "         (연락처)", normalFont);
            addLabelCell(claimantTable, "주소", normalFont);
            addValueCell(claimantTable, getString(contentJson, "claimantAddress"), normalFont);
            document.add(claimantTable);

            addFullRowCell(mainTable, "피청구인",
                    foundCase.getAgencyName() != null ? foundCase.getAgencyName() : "", boldFont, normalFont);
            addFullRowCell(mainTable, "구분", "보충서면", boldFont, normalFont);

            PdfPCell labelCell = new PdfPCell(new Phrase("제출 내용", boldFont));
            labelCell.setPadding(5f);
            labelCell.setMinimumHeight(150f);
            mainTable.addCell(labelCell);

            PdfPCell contentCell = new PdfPCell(new Phrase(getString(contentJson, "submissionContent"), normalFont));
            contentCell.setPadding(5f);
            contentCell.setMinimumHeight(150f);
            mainTable.addCell(contentCell);

            document.add(mainTable);

            LocalDate today = LocalDate.now();
            Paragraph footer = new Paragraph(
                    "「행정심판법」 제33조제1항에 따라 위와 같이 보충서면을 제출합니다.\n\n"
                            + today.getYear() + "년    " + today.getMonthValue() + "월    " + today.getDayOfMonth() + "일\n\n"
                            + "                                                         제출인                    (서명 또는 인)\n\n"
                            + "○○행정심판위원회  귀중", normalFont);
            footer.setSpacingBefore(10f);
            document.add(footer);

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new BusinessException(ErrorCode.PDF_CONVERT_FAILED);
        }
    }

    private void addGrayCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(new java.awt.Color(180, 180, 180));
        cell.setPadding(5f);
        table.addCell(cell);
    }

    private void addMergedLeftCell(PdfPTable table, String text, Font font, int rowspan) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setRowspan(rowspan);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(5f);
        table.addCell(cell);
    }

    private void addLabelCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(5f);
        table.addCell(cell);
    }

    private void addValueCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(5f);
        table.addCell(cell);
    }

    private void addFullRowCell(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
        labelCell.setPadding(5f);
        labelCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, valueFont));
        valueCell.setPadding(5f);
        table.addCell(valueCell);
    }

    private String getString(Map<String, Object> map, String key) {
        Object val = map.get(key);
        return val != null ? val.toString() : "";
    }

    private String buildCommitteeText(String committeeType) {
        if (committeeType == null || committeeType.isEmpty()) {
            return "[ ] 중앙행정심판위원회  [ ] ○○시·도행정심판위원회  [✓] 기타";
        }
        return switch (committeeType) {
            case "중앙행정" -> "[✓] 중앙행정심판위원회  [ ] ○○시·도행정심판위원회  [ ] 기타";
            case "시도행정" -> "[ ] 중앙행정심판위원회  [✓] ○○시·도행정심판위원회  [ ] 기타";
            default ->        "[ ] 중앙행정심판위원회  [ ] ○○시·도행정심판위원회  [✓] 기타";
        };
    }
}