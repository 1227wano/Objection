import ModalFrame from '@/components/ui/ModalFrame';
import RegistForm from '@/components/form/RegistForm';

export default function RegistInterceptRoute() {
  return (
    // 세로 화면이 850px 이하일 때만 넓고(max-w-2xl), 그 이상이면 원래의 날씬한 크기(max-w-md)로 돌아갑니다.
    <ModalFrame maxWidth="max-w-md [@media_screen_and_(max-height:850px)]:max-w-2xl">
      <RegistForm />
    </ModalFrame>
  );
}
