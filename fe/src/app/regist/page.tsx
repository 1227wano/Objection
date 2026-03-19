import RegistForm from '@/components/form/RegistForm';

export default function RegistPage() {
  return (
    <div className="min-h-screen py-20 flex justify-center items-start bg-[#F8FAFC]">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl mt-10 border border-gray-100">
        <RegistForm />
      </div>
    </div>
  );
}
