import ModalFrame from '@/components/ui/ModalFrame';
import MyPageForm from '@/components/form/MyPageForm';

export default function MyPageInterceptRoute() {
  return (
    <ModalFrame>
      <MyPageForm />
    </ModalFrame>
  );
}
