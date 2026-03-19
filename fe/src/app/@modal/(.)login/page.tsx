import ModalFrame from '@/components/ui/ModalFrame';
import LoginForm from '@/components/form/LoginForm';

export default function LoginInterceptRoute() {
  return (
    <ModalFrame>
      <LoginForm />
    </ModalFrame>
  );
}
