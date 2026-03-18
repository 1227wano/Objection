'use client';

import { useRef, useState } from 'react';

interface UploadFormProps {
  onFileSelect: (file: File) => void | Promise<void>;
  acceptedTypes?: string;
}

export default function UploadForm({
  onFileSelect,
  acceptedTypes = '.pdf, .jpg, .png',
}: UploadFormProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 파일이 드롭존 위로 올라왔을 때
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isUploading) setIsDragging(true);
  };

  // 파일이 드롭존 밖으로 나갔을 때
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // 파일 형식(확장자, MIME 타입) 유효성 검사 함수
  const isValidFile = (file: File) => {
    if (acceptedTypes === '*/*') return true;
    const types = acceptedTypes.split(',').map((t) => t.trim().toLowerCase());
    return types.some((type) => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type);
      } else if (type.endsWith('/*')) {
        const baseMimeType = type.replace('/*', '');
        return file.type.startsWith(baseMimeType);
      }
      return file.type === type;
    });
  };

  // 파일을 드롭했을 때
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (isUploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (e.dataTransfer.files.length > 1) {
        alert('단일 파일만 업로드 가능합니다.');
        e.dataTransfer.clearData();
        return;
      }

      const file = e.dataTransfer.files[0];

      if (!isValidFile(file)) {
        alert(`지원하지 않는 파일 형식입니다.\n지원 형식: ${acceptedTypes}`);
        e.dataTransfer.clearData();
        return;
      }

      setFileName(file.name);
      setIsUploading(true);
      try {
        await onFileSelect(file);
      } finally {
        setIsUploading(false);
      }
      e.dataTransfer.clearData();
    }
  };

  // 클릭해서 파일 탐색기에서 파일을 선택했을 때
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (!isValidFile(file)) {
        alert(`지원하지 않는 파일 형식입니다.\n지원 형식: ${acceptedTypes}`);
        e.target.value = ''; // input 초기화
        return;
      }

      setFileName(file.name);
      setIsUploading(true);
      try {
        await onFileSelect(file);
      } finally {
        setIsUploading(false);
      }
      // 동일한 파일 재업로드 가능하도록 input 초기화
      e.target.value = '';
    }
  };

  // 드롭존 클릭 시 숨겨진 input을 대신 클릭하도록 처리
  const handleClick = () => {
    if (!isUploading) {
      inputRef.current?.click();
    }
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
        {isUploading ? (
          <>
            <span className="block text-4xl mb-3">⏳</span>
            <p className="font-semibold text-lg text-blue-600">파일 검증중...</p>
            <p className="text-sm mt-2">잠시만 기다려주세요.</p>
          </>
        ) : fileName ? (
          <>
            <span className="block text-4xl mb-3 text-blue-500">✅</span>
            <p className="font-semibold text-lg text-blue-600 break-all">{fileName}</p>
            <p className="text-sm mt-2">파일이 성공적으로 선택되었습니다.</p>
          </>
        ) : (
          <>
            <span className="block text-4xl mb-3">📄</span>
            <p className="font-semibold text-lg">
              네모 안으로 파일을 드래그 하거나, 클릭해서 업로드해주세요
            </p>
            <p className="text-sm mt-2">
              지원 형식: {acceptedTypes === '*/*' ? '모든 파일' : acceptedTypes}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
