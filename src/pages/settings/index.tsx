import { useState } from "react"
import {  updatePassword } from "firebase/auth"


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


const SettingsPage = () => {

  
  const user = auth.currentUser

  
  
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [loading, setLoading] = useState(false)

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
    </div>
  )
}

export default SettingsPage
