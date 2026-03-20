package com.objection.auth.service;

import com.objection.common.exception.ExpiredCodeException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final StringRedisTemplate redisTemplate;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final long CODE_TTL_MINUTES = 5;
    private static final String KEY_PREFIX = "email:code:";

    // 인증 코드 발송
    public void sendVerificationCode(String email, String purpose) {
        String code = generateCode();
        String redisKey = buildKey(email, purpose);

        // redis 5분 TTL로 저장
        redisTemplate.opsForValue().set(redisKey, code, CODE_TTL_MINUTES, TimeUnit.MINUTES);
        sendEmail(email, code);
    }

    public void verifyCode(String email, String code, String purpose) {
        String redisKey = buildKey(email, purpose);
        String saved = redisTemplate.opsForValue().get(redisKey);

        if(saved == null) {
            throw new ExpiredCodeException("만료된 인증 코드입니다.");
        }

        if(!saved.equals(code)) {
            throw new IllegalArgumentException("인증 코드가 올바르지 않습니다.");
        }

        // 검증 성공 후 즉시 삭제 - 재사용 공격 방지
        redisTemplate.delete(redisKey);
    }

    private void sendEmail(String email, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("[이의있음] 이메일 인증 코드");
        message.setText("인증 코드: " + code + "\n\n5분 이내에 입력해주세요.");
        mailSender.send(message);
    }

    private String buildKey(String email, String purpose) {
        return KEY_PREFIX + purpose + ":" + email;
    }

    // 6자리 랜덤 숫자 코드 생성
    private String generateCode() {
        return String.format("%06d", SECURE_RANDOM.nextInt(1_000_000));
    }
}
