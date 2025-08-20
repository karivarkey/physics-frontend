"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LogOut, LifeBuoy, Settings, LayoutDashboard, Zap } from "lucide-react";
import { auth } from "@/lib/firebase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut, onAuthStateChanged, getIdTokenResult } from "firebase/auth";
import { toast } from "react-hot-toast";
import Logo from "./Logo";
const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

const Header = () => {
  const [userName, setUserName] = useState<string>("Guest User");
  const [userEmail, setUserEmail] = useState<string>("guest@example.com");
  const [userImage, setUserImage] = useState<string | null>(null);
  const [isTeacher, setIsTeacher] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserName(user.displayName || "Anonymous");
        setUserEmail(user.email || "unknown@example.com");
        setUserImage(user.photoURL);

        try {
          const tokenResult = await getIdTokenResult(user);
          const teacherClaim = tokenResult.claims.teacher;
          const adminClaim = tokenResult.claims.admin;
          setIsTeacher(
            typeof teacherClaim === "boolean" ? teacherClaim : false
          );
          setIsAdmin(typeof adminClaim === "boolean" ? adminClaim : false);
        } catch (err) {
          console.error("Error fetching claims:", err);
        }
      } else {
        setUserName("Guest User");
        setUserEmail("guest@example.com");
        setUserImage(null);
        setIsTeacher(false);
      }
    });

    return () => unsub();
  }, []);

  const initials = getInitials(userName || "GU");

  // 👇 centralized helper
  const route = (path: string) => (isTeacher ? `/teacher${path}` : path);

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
      className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-border/40 bg-background/95 px-6 backdrop-blur-sm"
    >
      {/* Left Section - Branding */}

      <Logo />
      {/* Right Section - User Menu */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage src={userImage || ""} alt={userName || ""} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userEmail}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => navigate(route("/home"))}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Home</span>
                <DropdownMenuShortcut>⇧⌘D</DropdownMenuShortcut>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => navigate(route("/admin/home"))}
                >
                  <Zap className="mr-2 h-4 w-4" />
                  <span>Admin Settings</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => navigate(route("/settings"))}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigate(route("/support"))}
            >
              <LifeBuoy className="mr-2 h-4 w-4" />
              <span>Support</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-red-500 focus:bg-red-50 focus:text-red-600"
              onClick={() => {
                toast.promise(signOut(auth), {
                  loading: "Signing out...",
                  success: "Signed out successfully!",
                  error: "Error signing out.",
                });
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>
    </motion.header>
  );
};

export default Header;
