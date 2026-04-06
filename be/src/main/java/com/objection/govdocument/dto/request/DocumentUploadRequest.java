package com.objection.govdocument.dto.request;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter @Setter
public class DocumentUploadRequest {
    private String documentType; // NOTICE, ANSWER, DECISION, STAY_DECISION
    private String sourceType;   // IMAGE, FILE, MANUAL
    private MultipartFile file;  // FILE, IMAGE일 때
}