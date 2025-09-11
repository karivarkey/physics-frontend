import { useState } from "react"
import {  updatePassword } from "firebase/auth"
import axiosInstance from "@/lib/axios"

import toast from "react-hot-toast"


import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { auth } from "@/lib/firebase"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { allowedCombinations, type Division } from "@/pages/onboarding/classData"


const SettingsPage = () => {

  
  const user = auth.currentUser

  
  
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [loading, setLoading] = useState(false)
  // --- Class switch state ---
  const [branch, setBranch] = useState<string>("")
  const [division, setDivision] = useState<string>("")
  const [availableDivisions, setAvailableDivisions] = useState<Division[]>([])
  const [switching, setSwitching] = useState(false)

  // Handle photo change


  // Handle password reset
  const handlePasswordUpdate = async () => {
    if (!user) return
    setLoading(true)
    try {
      await updatePassword(user, newPassword)
      alert("Password updated successfully!")
      setCurrentPassword("")
      setNewPassword("")
    } catch (err) {
      console.error(err)
      alert("Error updating password. You may need to re-authenticate.")
    } finally {
      setLoading(false)
    }
  }

  const handleBranchChange = (code: string) => {
    setBranch(code)
    setDivision("")
    const selected = allowedCombinations.find(b => b.code === code)
    setAvailableDivisions(selected?.divisions ?? [])
  }

  const handleSwitchClass = async () => {
    if (!branch) {
      toast.error("Select a branch")
      return
    }
    const class_code = division ? `${branch}${division}` : branch
    try {
      setSwitching(true)
      await axiosInstance.post("/user/change-class", { class_code })
      toast.success("Class updated")
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to update class")
    } finally {
      setSwitching(false)
    }
  }

  return (
    <div className="space-y-8 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Password Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Change your password here. It's a good idea to use a strong password
            that you're not using anywhere else.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handlePasswordUpdate} disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </CardFooter>
      </Card>

      {/* Class Switcher (same logic as onboarding) */}
      <Card>
        <CardHeader>
          <CardTitle>Class</CardTitle>
          <CardDescription>Switch your branch/division.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="block mb-1">Branch</Label>
            <Select onValueChange={handleBranchChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select Branch" />
              </SelectTrigger>
              <SelectContent>
                {allowedCombinations.map((b) => (
                  <SelectItem key={b.code} value={b.code}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="block mb-1">Division</Label>
            <Select
              onValueChange={(v) => setDivision(v)}
              disabled={!branch || availableDivisions.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Division" />
              </SelectTrigger>
              <SelectContent>
                {availableDivisions.map((d) => (
                  <SelectItem key={d.code} value={d.code}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleSwitchClass} disabled={switching}>
            {switching ? "Updating..." : "Switch Class"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default SettingsPage
