'use client';
import Image from 'next/image';
import ModalFrame from '@/components/ui/ModalFrame';
import UploadForm from '@/components/form/UploadForm';
import { useState } from 'react';
export default function Home() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <Image src="/file.svg" alt="file" width={100} height={100} />
      <div className="flex flex-col items-center">
        Hello world 안녕하세요
        <button className="border px-2" onClick={() => setOpen(true)}>
          열기
        </button>
        <UploadForm onFileSelect={(file) => console.log(file)} />
      </div>
      {open && <ModalFrame onClose={() => setOpen(false)}> 올리는중. . . </ModalFrame>}
    </div>
  );
}
