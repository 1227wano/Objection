/**
 * JWT 관련 유틸리티 함수
 */

export interface JwtPayload {
  userId: string;
  userName?: string;
  exp: number;
  [key: string]: any;
}

/**
 * JWT 토큰의 페이로드를 디코딩하여 반환합니다.
 */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return null;
    
    // Base64 디코딩 (atob 사용)
    const decodedPayload = JSON.parse(atob(payloadBase64));
    return decodedPayload as JwtPayload;
  } catch (error) {
    console.error('JWT Decoding Error:', error);
    return null;
  }
}

/**
 * 토큰이 만료되었는지 확인합니다.
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJwt(token);
  if (!payload || !payload.exp) return true;
  
  const expirationTime = payload.exp * 1000;
  return Date.now() >= expirationTime;
}
