
import Header from "@/components/home/header/Header";
import { auth } from "@/lib/firebase";
const Home = () => {
  const userName = auth.currentUser?.displayName || "Guest";
  const userEmail = auth.currentUser?.email || "guest@example.com";
  const userImage = auth.currentUser?.photoURL || "";

  return (
    <div>
      <Header userName={userName} userEmail={userEmail} userImage={userImage} />
      <main className="p-6">
        <h1 className="text-2xl font-semibold">Welcome to RSETLABS 🚀</h1>
      </main>
    </div>
  );
};

export default Home;
