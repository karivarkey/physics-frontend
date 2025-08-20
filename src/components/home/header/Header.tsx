"use client";

import { motion } from "framer-motion";
import { 
  LogOut, 
  LifeBuoy, 
  Settings, 
  LayoutDashboard,
  Atom
} from "lucide-react";
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
import { signOut } from "firebase/auth";
import { toast } from "react-hot-toast";

type Props = {
  userName?: string | null;
  userEmail?: string | null;
  userImage?: string | null;
  teacher?: boolean | false;
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
};

const Header = ({
  userName = "Guest User",
  userEmail = "guest@example.com",
  userImage,
  teacher = false,
}: Props) => {
  const initials = getInitials(userName || "GU");
  const navigate = useNavigate();

  // 👇 centralized helper
  const route = (path: string) =>
    teacher ? `/teacher${path}` : path;

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
      className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-border/40 bg-background/95 px-6 backdrop-blur-sm"
    >
      {/* Left Section - Branding */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <a href={route("/dashboard")} className="flex items-center gap-2.5">
          <Atom className="h-7 w-7 text-blue-500" />
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tighter bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              RSET LABS
            </span>
            <span className="text-xs text-muted-foreground -mt-1">
              Simulating Tomorrow&apos;s Breakthroughs
            </span>
          </div>
        </a>
      </motion.div>

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
