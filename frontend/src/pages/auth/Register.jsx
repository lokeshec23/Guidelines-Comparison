import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [userInfo, setUserInfo] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo({ ...userInfo, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !userInfo.username ||
      !userInfo.email ||
      !userInfo.password ||
      !userInfo.confirmPassword
    ) {
      toast.error("All fields are required");
      return;
    }

    if (userInfo.password !== userInfo.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await register(
        userInfo.username.trim(),
        userInfo.email.trim().toLowerCase(),
        userInfo.password
      );
      toast.success("Registration successful!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/auth_page_bg.png')" }}
    >
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src="/loandna_logo.svg" alt="Logo" className="h-10" />
        </div>

        <h2 className="text-xl font-bold text-center mb-4">Register</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              value={userInfo.username}
              onChange={handleChange}
              placeholder="Enter your username"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={userInfo.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={userInfo.password}
              onChange={handleChange}
              placeholder="Create a password"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={userInfo.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none"
              required
            />
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center bg-sky-500 text-white py-2 rounded-lg hover:bg-sky-600 transition disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Register →"
              )}
            </button>
          </div>
        </form>

        <p className="text-sm text-center mt-3">
          Already have an account?{" "}
          <Link to="/login" className="text-sky-500 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
