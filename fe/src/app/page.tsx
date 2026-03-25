import HeroSection from '@/app/_components/HeroSection';
import DashboardHome from '@/app/_components/DashboardHome';
import ProcessSection from '@/app/_components/ProcessSection';
import FeatureSection from '@/app/_components/FeatureSection';
import { getCurrentUser } from '@/lib/current-user';

export default async function Home() {
  const currentUser = await getCurrentUser();
  const isLoggedIn = !!currentUser;

  if (isLoggedIn) {
    return (
      <div className="flex w-full flex-col bg-mainbgcolor">
        <DashboardHome />
        <ProcessSection />
        <FeatureSection />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col bg-mainbgcolor">
      <HeroSection />
      <ProcessSection />
      <FeatureSection />
    </div>
  );
}
