import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "Roger@daginsure";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate credentials
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Store admin session
      localStorage.setItem(
        "adminSession",
        JSON.stringify({
          username,
          loginTime: new Date().toISOString(),
        })
      );
      toast.success("Admin login successful!");
      window.location.href = "/certification/admin/dashboard";
    } else {
      toast.error("Invalid admin credentials");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-600 mb-2">MineTrans</h1>
          <p className="text-slate-400">Admin Portal</p>
        </div>

        {/* Login Card */}
        <Card className="bg-slate-800 border-amber-600/30 p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Username
              </label>
              <Input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter admin username"
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                disabled={loading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                disabled={loading}
              />
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2"
            >
              {loading ? "Logging in..." : "Admin Login"}
            </Button>
          </form>

          {/* Info Message */}
          <div className="mt-6 p-4 bg-slate-700/50 border border-slate-600 rounded text-sm text-slate-300">
            <p className="font-semibold text-amber-600 mb-1">
              Demo Credentials:
            </p>
            <p>
              Username:{" "}
              <code className="bg-slate-800 px-2 py-1 rounded">admin</code>
            </p>
            <p>
              Password:{" "}
              <code className="bg-slate-800 px-2 py-1 rounded">
                Roger@daginsure
              </code>
            </p>
          </div>
        </Card>

        {/* Back Link */}
        <div className="text-center mt-6">
          <a
            href="/certification"
            className="text-amber-600 hover:text-amber-500 text-sm"
          >
            ← Back to Certification
          </a>
        </div>
      </div>
    </div>
  );
}
