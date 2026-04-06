package com.objection.auth.service;

import com.objection.auth.dto.request.LoginRequest;
import com.objection.auth.dto.request.PasswordResetRequest;
import com.objection.auth.dto.request.SignupRequestDto;
import com.objection.auth.dto.response.LoginResponse;
import com.objection.auth.dto.response.TokenRefreshResponse;
import com.objection.common.exception.BusinessException;
import com.objection.common.exception.ErrorCode;
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

    @Transactional
    public void signup(SignupRequestDto request) {
        if (userRepository.existsByUserId(request.userId())) {
            throw new BusinessException(ErrorCode.USER_ALREADY_EXISTS);
        }

        User user = User.builder()
                .userId(request.userId())
                .userPw(passwordEncoder.encode(request.userPw()))
                .userName(request.userName())
                .build();

        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUserId(request.userId())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_CREDENTIALS));

        if (user.isDeleted()) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }

        if (!passwordEncoder.matches(request.userPw(), user.getUserPw())) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }

        String accessToken = jwtUtil.generateAccessToken(user.getUserId());
        String refreshToken = jwtUtil.generateRefreshToken(user.getUserId());

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
                user.getUserId(),
                user.getUserName()
        );
    }

    public void logout(String accessToken) {
        long remaining = jwtUtil.getRemainingExpiration(accessToken);
        if (remaining > 0) {
            redisTemplate.opsForValue().set(
                    BLACKLIST_KEY_PREFIX + accessToken,
                    "logout",
                    remaining,
                    TimeUnit.MILLISECONDS
            );
        }

        String userId = jwtUtil.getUserId(accessToken);
        redisTemplate.delete(REFRESH_KEY_PREFIX + userId);
    }

    public TokenRefreshResponse refresh(String refreshToken) {
        if (!jwtUtil.validateToken(refreshToken)) {
            throw new BusinessException(ErrorCode.REFRESH_TOKEN_INVALID);
        }

        String userId = jwtUtil.getUserId(refreshToken);
        String savedToken = redisTemplate.opsForValue().get(REFRESH_KEY_PREFIX + userId);

        if (savedToken == null) {
            throw new BusinessException(ErrorCode.REFRESH_TOKEN_EXPIRED);
        }

        if (!savedToken.equals(refreshToken)) {
            redisTemplate.delete(REFRESH_KEY_PREFIX + userId);
            throw new BusinessException(ErrorCode.REFRESH_TOKEN_INVALID);
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

    @Transactional
    public void resetPassword(PasswordResetRequest request) {
        emailService.verifyCode(request.userId(), request.code(), "PASSWORD_RESET");

        User user = userRepository.findByUserId(request.userId())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        user.updatePassword(passwordEncoder.encode(request.newPw()));
    }
}