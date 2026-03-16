import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <Image src="/file.svg" alt="file" width={100} height={100} />
      Hello world
      안녕하세요
    </div>
  );
}
