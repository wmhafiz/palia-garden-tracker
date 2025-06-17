import { MainTracker } from '@/components/MainTracker';
import Header from '@/components/Header';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MainTracker />
    </div>
  );
}
