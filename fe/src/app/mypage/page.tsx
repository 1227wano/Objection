import MyPageForm from '@/components/form/MyPageForm';

export default function MyPagePage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <MyPageForm />
      </div>
    </div>
  );
}
