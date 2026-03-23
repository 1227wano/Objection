package com.objection.cases.service;

import com.objection.cases.dto.request.CaseTitleUpdateRequest;
import com.objection.cases.dto.response.*;
import com.objection.cases.entity.Case;
import com.objection.cases.enums.CaseStatus;
import com.objection.cases.enums.StayStatus;
import com.objection.cases.repository.CaseRepository;
import com.objection.common.exception.BusinessException;
import com.objection.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CaseService {

    private final CaseRepository caseRepository;

    @Transactional
    public CaseCreateResponse createCase(Integer userNo) {
        Case newCase = Case.builder()
                .userNo(userNo)
                .title("행정처분 사건 #0")
                .status(CaseStatus.STARTED)
                .stayStatus(StayStatus.NONE)
                .build();

        Case saved = caseRepository.saveAndFlush(newCase);
        saved.updateTitle("행정처분 사건 #" + saved.getCaseNo());

        return new CaseCreateResponse(
                saved.getCaseNo(),
                saved.getTitle(),
                saved.getStatus().name(),
                saved.getCreatedAt()
        );
    }

    public List<CaseListResponse> getCases(Integer userNo) {
        List<Case> cases = caseRepository.findByUserNoOrderByUpdatedAtDesc(userNo);

        return cases.stream()
                .map(c -> new CaseListResponse(
                        c.getCaseNo(),
                        c.getTitle(),
                        c.getStatus().name(),
                        c.getStayStatus().name(),
                        c.getClaimType() != null ? c.getClaimType().name() : null,
                        c.getSanctionType(),
                        c.getSanctionDays(),
                        c.getAgencyName(),
                        c.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    public CaseStatusResponse getCaseStatus(Integer caseNo, Integer userNo) {
        Case found = getCaseOrThrow(caseNo);
        validateOwner(found, userNo);

        return new CaseStatusResponse(
                found.getCaseNo(),
                found.getStatus().name(),
                found.getStayStatus().name()
        );
    }

    @Transactional
    public CaseTitleUpdateResponse updateTitle(Integer caseNo, Integer userNo, CaseTitleUpdateRequest request) {
        Case found = getCaseOrThrow(caseNo);
        validateOwner(found, userNo);

        found.updateTitle(request.getTitle());

        return new CaseTitleUpdateResponse(
                found.getCaseNo(),
                found.getTitle(),
                found.getUpdatedAt()
        );
    }

    private Case getCaseOrThrow(Integer caseNo) {
        return caseRepository.findById(caseNo)
                .orElseThrow(() -> new BusinessException(ErrorCode.CASE_NOT_FOUND));
    }

    private void validateOwner(Case found, Integer userNo) {
        if (!found.getUserNo().equals(userNo)) {
            throw new BusinessException(ErrorCode.CASE_ACCESS_DENIED);
        }
    }
}