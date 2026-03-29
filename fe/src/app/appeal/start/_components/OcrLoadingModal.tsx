'use client';

import ModalFrame from '@/components/ui/ModalFrame';
import OcrLoadingScreen from '@/app/appeal/_components/OcrLoadingScreen';

export default function OcrLoadingModal() {
  return (
    <ModalFrame closeOnOverlayClick={false} maxWidth="max-w-sm">
      <OcrLoadingScreen />
    </ModalFrame>
  );
}
