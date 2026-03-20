package com.objection.auth.service;


import com.objection.auth.dto.request.LoginRequest;
import com.objection.auth.dto.request.PasswordResetRequest;
import com.objection.auth.dto.request.SignupRequestDto;
import com.objection.auth.dto.response.LoginResponse;
import com.objection.auth.dto.response.TokenRefreshResponse;
import com.objection.common.exception.ExpiredCodeException;
import com.objection.user.entity.User;
import com.objection.user.repository.UserRepository;
import com.objection.security.JwtProperties;
import com.objection.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final JwtProperties jwtProperties;
    private final StringRedisTemplate redisTemplate;
    private final EmailService emailService;

    private static final String REFRESH_KEY_PREFIX = "refresh:";
    private static final String BLACKLIST_KEY_PREFIX = "blacklist:";

    // 회원 가입
    @Transactional
    public void signup(SignupRequestDto request) {
        if(userRepository.existsByUserId(request.userId())) {
            throw new IllegalStateException("이미 존재하는 아이디입니다.");
        }

        User user = User.builder()
                .userId(request.userId())
                .userPw(passwordEncoder.encode(request.userPw()))
                .userName(request.userName())
                .build();

        userRepository.save(user);
    }

    // 로그인
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {

        // 1번 — 유저가 없을 때
        User user = userRepository.findByUserId(request.userId())
                .orElseThrow(() -> new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다."));

        // 2번 — 탈퇴한 유저일 때
        if (user.isDeleted()) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다.");
        }

        // 3번 — 비밀번호가 틀렸을 때
        if (!passwordEncoder.matches(request.userPw(), user.getUserPw())) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다.");
        }


        String accessToken = jwtUtil.generateAccessToken(user.getUserId());
        String refreshToken = jwtUtil.generateRefreshToken(user.getUserId());

        // Refresh Token Redis 저장
        redisTemplate.opsForValue().set(
                REFRESH_KEY_PREFIX + user.getUserId(),
                refreshToken,
                jwtProperties.getRefreshExpiration(),
                TimeUnit.MILLISECONDS
        );

        return LoginResponse.of(
                accessToken,
                refreshToken,
                jwtProperties.getAccessExpiration() / 1000,
                user.getUserName()
        );
    }
        // 로그아웃
        public void logout(String accessToken) {
            // Access Token 블랙리스트 등록
            long remaining = jwtUtil.getRemainingExpiration(accessToken);
            if (remaining > 0) {
                redisTemplate.opsForValue().set(
                        BLACKLIST_KEY_PREFIX + accessToken,
                        "logout",
                        remaining,
                        TimeUnit.MILLISECONDS
                );
            }

            // Refresh Token 삭제
            String userId = jwtUtil.getUserId(accessToken);
            redisTemplate.delete(REFRESH_KEY_PREFIX + userId);
        }

        // 토큰 재발급
        public TokenRefreshResponse refresh(String refreshToken) {
            if (!jwtUtil.validateToken(refreshToken)) {
                throw new IllegalArgumentException("유효하지 않은 Refresh Token입니다.");
            }

            String userId = jwtUtil.getUserId(refreshToken);
            String savedToken = redisTemplate.opsForValue().get(REFRESH_KEY_PREFIX + userId);

            if (savedToken == null) {
                throw new ExpiredCodeException("만료된 Refresh Token입니다.");
            }

            // 탈취 감지 — 저장값과 불일치 시 전체 폐기
            if (!savedToken.equals(refreshToken)) {
                redisTemplate.delete(REFRESH_KEY_PREFIX + userId);
                throw new IllegalArgumentException("유효하지 않은 Refresh Token입니다.");
            }

            String newAccessToken = jwtUtil.generateAccessToken(userId);
            String newRefreshToken = jwtUtil.generateRefreshToken(userId);

            redisTemplate.opsForValue().set(
                    REFRESH_KEY_PREFIX + userId,
                    newRefreshToken,
                    jwtProperties.getRefreshExpiration(),
                    TimeUnit.MILLISECONDS
            );

            return TokenRefreshResponse.of(
                    newAccessToken,
                    newRefreshToken,
                    jwtProperties.getAccessExpiration() / 1000
            );
        }

        // 비밀번호 재설정 (이메일 인증 후)
        @Transactional
        public void resetPassword(PasswordResetRequest request) {
            emailService.verifyCode(request.userId(), request.code(), "PASSWORD_RESET");

            User user = userRepository.findByUserId(request.userId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다."));

            user.updatePassword(passwordEncoder.encode(request.newPw()));

    }
}
