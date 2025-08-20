// components/Layout.tsx

import Header from "./home/header/Header";


export default function Layout({ children }: { children: React.ReactNode }) {
    const currentPath = window.location.pathname ;



  return (
    <div>
      {  !currentPath.endsWith("/login") && !currentPath.endsWith("/signup") && <Header />}

      <main>{children}</main>
    </div>
  );
}
