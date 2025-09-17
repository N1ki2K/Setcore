import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { toast } from "sonner";
import { apiService } from "@/services/api";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (userData: { token: string; user: any }) => void;
}

const AuthDialog = ({ open, onOpenChange, onSuccess }: AuthDialogProps) => {
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginForm.email || !loginForm.password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.login({
        email: loginForm.email,
        password: loginForm.password
      });

      onSuccess(response.data);
      onOpenChange(false);
      toast.success("Successfully logged in!");

      setLoginForm({ email: "", password: "" });
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!registerForm.username || !registerForm.email || !registerForm.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (registerForm.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(registerForm.password)) {
      toast.error("Password must contain at least one lowercase letter, one uppercase letter, and one number");
      return;
    }

    if (registerForm.username.length < 3) {
      toast.error("Username must be at least 3 characters long");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(registerForm.username)) {
      toast.error("Username can only contain letters, numbers, and underscores");
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.register({
        username: registerForm.username,
        email: registerForm.email,
        password: registerForm.password,
        first_name: registerForm.firstName,
        last_name: registerForm.lastName
      });

      // After registration, automatically log the user in
      const loginResponse = await apiService.login({
        email: registerForm.email,
        password: registerForm.password
      });

      onSuccess(loginResponse.data);
      onOpenChange(false);
      toast.success("Account created successfully!");

      setRegisterForm({
        username: "",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: ""
      });
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Welcome to Setcore</DialogTitle>
          <DialogDescription>
            Sign in to your account or create a new one to get started.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email or Username</Label>
                <Input
                  id="login-email"
                  type="text"
                  placeholder="Enter your email or username"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-username">Username * (3+ chars, letters/numbers/_)</Label>
                <Input
                  id="register-username"
                  placeholder="Choose a username"
                  value={registerForm.username}
                  onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="register-firstname">First Name</Label>
                  <Input
                    id="register-firstname"
                    placeholder="First name"
                    value={registerForm.firstName}
                    onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-lastname">Last Name</Label>
                  <Input
                    id="register-lastname"
                    placeholder="Last name"
                    value={registerForm.lastName}
                    onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Email *</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="Enter your email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">Password * (min 6 chars, must include A-Z, a-z, 0-9)</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="Create a password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-confirm">Confirm Password *</Label>
                <Input
                  id="register-confirm"
                  type="password"
                  placeholder="Confirm your password"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;