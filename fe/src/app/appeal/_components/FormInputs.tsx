'use client';

import { useFormContext } from 'react-hook-form';

export function EditableInput({
  name,
  className = '',
}: {
  name: string;
  className?: string;
}) {
  const { register } = useFormContext();
  return (
    <input
      type="text"
      {...register(name)}
      className={`bg-transparent w-full outline-none focus:ring-1 focus:ring-blue-400 px-1 py-0.5 ${className}`}
    />
  );
}

export function EditableTextarea({
  id,
  name,
  rows = 4,
  className = '',
}: {
  id?: string;
  name: string;
  rows?: number;
  className?: string;
}) {
  const { register } = useFormContext();
  return (
    <textarea
      id={id}
      {...register(name)}
      rows={rows}
      className={`w-full bg-transparent outline-none focus:ring-1 focus:ring-blue-400 p-1 resize-y leading-relaxed ${className}`}
    />
  );
}
