// "use client";
// import { useState } from "react";
// import Sidebar from "../ui/dashboard/sidebar/sidebar";
// import Header from "../ui/dashboard/header/header";
// import styles from "../ui/dashboard/layout.module.css";
// import Footer from "../ui/dashboard/footer/page";
// import Navbar from "../ui/dashboard/navbar/navbar";


// const Layout = ({ children }) => {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   const toggleSidebar = () => {
//     setIsSidebarOpen((prev) => !prev);
//   };

//   return (
//     <div className={styles.container}>
//       {/* Sidebar */}
//       <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

//       {/* Main content */}
//       <div className={`${styles.main} ${isSidebarOpen ? styles.shift : ""}`}>
//         <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
//         <div className={styles.content}><Navbar />{children}<Footer/></div>
//       </div>
//     </div>
//   );
// };

// export default Layout;


"use client";
import { useEffect, useState } from "react";
import Sidebar from "../ui/dashboard/sidebar/sidebar";
import Header from "../ui/dashboard/header/header";
import styles from "../ui/dashboard/layout.module.css";
import Footer from "../ui/dashboard/footer/page";
import Navbar from "../ui/dashboard/navbar/navbar";
import { useRouter } from "next/navigation";

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAllowed, setIsAllowed] = useState(false);
  const router = useRouter();

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");

    if (!isLoggedIn) {
      router.push("/"); // redirect to login or home
    } else {
      setIsAllowed(true);
    }
  }, [router]);

  // Don’t render anything until access is confirmed
  if (!isAllowed) return null;

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main content */}
      <div className={`${styles.main} ${isSidebarOpen ? styles.shift : ""}`}>
        <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className={styles.content}>
          <Navbar />
          {children}
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Layout;
