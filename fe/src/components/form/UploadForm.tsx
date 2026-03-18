'use client';

import { useRef, useState } from 'react';

interface UploadFormProps {
  onFileSelect: (file: File) => void;
  acceptedTypes?: string; // 예: ".pdf, .jpg, .png"
}

export default function UploadForm({ onFileSelect, acceptedTypes = '*/*' }: UploadFormProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 파일이 드롭존 위로 올라왔을 때
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // 파일이 드롭존 밖으로 나갔을 때
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // 파일을 드롭했을 때
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  // 클릭해서 파일 탐색기에서 파일을 선택했을 때
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  // 드롭존 클릭 시 숨겨진 input을 대신 클릭하도록 처리
  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div
      className={`flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      {/* 실제 동작하지만 화면에는 보이지 않는 input */}
      <input
        type="file"
        ref={inputRef}
        onChange={handleChange}
        accept={acceptedTypes}
        className="hidden"
      />

      {/* 화면에 보여지는 UI */}
      <div className="text-gray-500 text-center pointer-events-none">
        <span className="block text-4xl mb-3">📄</span>
        <p className="font-semibold text-lg">파일을 끌어다 놓거나 클릭하여 업로드해 주세요.</p>
        <p className="text-sm mt-2">
          지원 형식: {acceptedTypes === '*/*' ? '모든 파일' : acceptedTypes}
        </p>
      </div>
    </div>
  );
}
