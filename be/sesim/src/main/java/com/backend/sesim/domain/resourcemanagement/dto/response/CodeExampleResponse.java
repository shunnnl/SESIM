package com.backend.sesim.domain.resourcemanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodeExampleResponse {
    private String codeExample;

    public static CodeExampleResponse from(String codeExample) {
        return CodeExampleResponse.builder()
                .codeExample(codeExample)
                .build();
    }
}