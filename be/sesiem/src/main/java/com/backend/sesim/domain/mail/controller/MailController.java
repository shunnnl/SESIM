package com.backend.sesim.domain.mail.controller;

import com.backend.sesim.domain.mail.dto.request.MailDTO;
import com.backend.sesim.domain.mail.dto.request.MailVerifyDTO;
import com.backend.sesim.domain.mail.service.MailService;
import com.backend.sesim.global.dto.CommonResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/mail")
@Tag(name = "이메일 인증 컨트롤러", description = "이메일 인증을 처리하는 컨트롤러")
public class MailController {

    private final MailService mailService;

    @PostMapping("/send-code")
    @Operation(summary = "이메일 인증 코드 발송", description = "입력받은 이메일로 인증 코드를 발송합니다.")
    public CommonResponseDto sendVerificationCode(@RequestBody MailDTO mailDTO) {
        mailService.sendVerificationEmail(mailDTO.getEmail());
        return CommonResponseDto.ok();
    }

    @PostMapping("/verify")
    @Operation(summary = "이메일 인증 코드 확인", description = "발송된 인증 코드를 검증합니다.")
    public CommonResponseDto verifyCode(@RequestBody MailVerifyDTO mailVerifyDTO) {
        boolean isVerified = mailService.verifyCode(mailVerifyDTO.getEmail(), mailVerifyDTO.getCode());
        return CommonResponseDto.ok(isVerified);
    }
}