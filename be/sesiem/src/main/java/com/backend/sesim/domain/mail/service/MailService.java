package com.backend.sesim.domain.mail.service;

import com.backend.sesim.domain.mail.exception.MailErrorCode;
import com.backend.sesim.global.exception.GlobalException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import java.security.SecureRandom;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailService {

    private final JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    // 인증 코드를 임시 저장하는 맵 (실제 운영환경에서는 Redis 사용 권장)
    private final Map<String, String> verificationCodes = new ConcurrentHashMap<>();

    // 랜덤 인증번호 생성
    public String createNumber() {
        SecureRandom random = new SecureRandom();
        StringBuilder key = new StringBuilder();

        for (int i = 0; i < 6; i++) { // 6자리 숫자 인증코드
            key.append(random.nextInt(10));
        }
        return key.toString();
    }

    // 인증 메일 생성
    public MimeMessage createMail(String mail, String number) throws MessagingException {
        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom("Sesim 고객센터 <" + senderEmail + ">");
        helper.setTo(mail);
        helper.setSubject("Sesim 이메일 인증");

        String body = "";
        body += "<h2>Sesim 이메일 인증</h2>";
        body += "<p>안녕하세요. Sesim 서비스 가입을 환영합니다.</p>";
        body += "<p>아래 인증번호를 입력하여 이메일 인증을 완료해주세요.</p>";
        body += "<div style='background-color: #f8f9fa; padding: 15px; margin: 20px 0; text-align: center;'>";
        body += "<h1 style='color: #007bff; letter-spacing: 2px;'>" + number + "</h1>";
        body += "</div>";
        body += "<p>인증번호는 10분간 유효합니다.</p>";

        helper.setText(body, true);

        return message;
    }

    // 이메일 인증 코드 발송
    public void sendVerificationEmail(String email) {
        String number = createNumber();

        try {
            MimeMessage message = createMail(email, number);
            javaMailSender.send(message);

            // 발송된 인증번호 저장 (실제로는 Redis에 TTL과 함께 저장 권장)
            verificationCodes.put(email, number);

            log.info("이메일 인증 코드 발송 완료: {}", email);
        } catch (MessagingException | MailException e) {
            log.error("이메일 발송 실패: {}", e.getMessage());
            throw new GlobalException(MailErrorCode.EMAIL_SEND_FAILED);
        }
    }

    // 인증 코드 검증
    public boolean verifyCode(String email, String code) {
        String storedCode = verificationCodes.get(email);

        if (storedCode == null) {
            throw new GlobalException(MailErrorCode.VERIFICATION_CODE_EXPIRED);
        }

        if (!storedCode.equals(code)) {
            throw new GlobalException(MailErrorCode.INVALID_VERIFICATION_CODE);
        }

        // 인증 성공 시 코드 삭제
        verificationCodes.remove(email);
        return true;
    }
}