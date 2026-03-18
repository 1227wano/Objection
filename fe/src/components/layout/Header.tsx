import Link from "next/link"; // Next.js의 내장 링크 컴포넌트입니다. <a> 태그보다 페이지 전환 성능이 뛰어납니다.
import Image from "next/image"; // Next.js의 내장 이미지 컴포넌트입니다. 이미지 크기와 로딩 속도를 자동으로 최적화해줍니다.

// Header 컴포넌트가 받을 옵션(Prop)의 타입을 지정합니다.
// TypeScript의 장점이며, 아래와 같이 정해둔 변수만 받을 수 있도록 강제하여 버그를 줄입니다.
interface HeaderProps {
  isLoggedIn?: boolean; // 로그인 상태 여부 (true면 로그인, false면 비로그인)
  userName?: string;    // 로그인한 사용자의 이름
}

// export default: 이 파일(Header.tsx)을 가져다 쓸 때 Header가 기본적으로 제공되도록 합니다.
export default function Header({ isLoggedIn = false, userName = "OOO" }: HeaderProps) {
  return (
    // <header>: HTML의 구조적 의미(시맨틱)를 더해주는 태그입니다.
    // className="" 안에는 Tailwind CSS의 유틸리티 클래스들이 들어갑니다.
    // - w-full: 넓이 100%
    // - bg-[#E2E2E2]: 옅은 회색 배경화면
    // - flex justify-between: 안의 요소(로고 / 버튼)를 양 끝으로 멀리 떨어뜨립니다.
    <header className="w-full bg-[#E2E2E2] px-6 py-4 flex justify-between items-center border-b border-gray-300">

      {/* 1. 좌측 로고 영역 */}
      {/* href="/" : 로고를 클릭하면 프로젝트의 메인 페이지로 이동합니다. */}
      <Link href="/" className="flex items-center gap-2">
        {/* /logo.svg 파일은 public 폴더에 위치해야 브라우저가 찾을 수 있습니다. */}
        <Image
          src="/logo.svg"
          alt="이의있음! 로고"
          width={45}
          height={45}
          priority // 페이지가 처음 뜰 때 로고 이미지를 우선적으로 불러오라는 의미입니다.
          className="object-contain" // 이미지가 컨테이너를 벗어나지 않고 잘리지 않도록 맞춥니다.
        />
        <span className="text-xl font-bold text-[#141251] tracking-tight">
          이의있음!(Objection!)
        </span>
      </Link>

      {/* 2. 우측 버튼/프로필 영역 */}
      <div className="flex items-center gap-4">
        {/*
          [조건부 렌더링]: isLoggedIn이 true이냐 false이냐에 따라 다른 화면을 보여줍니다.
          물음표(?)와 콜론(:)을 사용하는 삼항 연산자 구조입니다.
        */}
        {isLoggedIn ? (
          // === 로그인 상태일 때 (true) ===
          <>
            <span className="text-[#141251] font-medium">
              {userName}님 환영합니다.
            </span>
            {/* 연필(수정) 아이콘 (히어로 아이콘 등의 SVG를 사용했습니다) */}
            <button aria-label="정보 수정" className="p-1 hover:bg-gray-300 rounded-full transition-colors text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
              </svg>
            </button>
          </>
        ) : (
          // === 비로그인 상태일 때 (false) ===
          <>
            <Link
              href="/login"
              className="bg-[#141251] text-white px-6 py-2 rounded font-semibold text-sm hover:bg-[#1a1766] transition-colors"
            >
              로그인
            </Link>
            <Link
              href="/regist"
              className="bg-white border border-[#141251] text-[#141251] px-6 py-2 rounded font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              회원가입
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
