import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import axiosInstance from "@/lib/axios";
import toast from "react-hot-toast";
import { auth } from "@/lib/firebase";

const SupportPage = () => {
  const [name, setName] = useState(auth.currentUser?.displayName || "");
  const [email, setEmail] = useState(auth.currentUser?.email || "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email || !message) {
      alert("Please fill all fields");
      return;
    }
    setLoading(true);

    axiosInstance
      .post("/user/support", { name, email, message })
      .then(() => {
        toast.success("Support request submitted successfully");
      })
      .catch((error) => {
        toast.error("Failed to submit support request");
        console.error("Support request error:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="space-y-8 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold">Support</h1>
        <p className="text-muted-foreground">
          Need help? Reach out to our Points of Contact or fill the support
          form.
        </p>
      </div>

      {/* POC Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dr Rinku Jacob</CardTitle>
            <CardDescription>Dept of ZXXXX</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>Email: xxxx@gmail.com</p>
            <p>Phone: +91 xxxxxxxxx</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mr Geevarghese Regi</CardTitle>
            <CardDescription>Support POC</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>Email: geevargheseregi78@gmail.com</p>
            <p>Phone: +91 8113029191</p>
          </CardContent>
        </Card>
      </div>

      {/* Support Form */}
      <Card>
        <CardHeader>
          <CardTitle>Submit a Support Request</CardTitle>
          <CardDescription>
            Fill in the form below and we’ll get back to you as soon as
            possible.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue..."
            />
          </div>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportPage;
