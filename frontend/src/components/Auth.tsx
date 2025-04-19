import React, { useState } from "react";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { FaGoogle, FaEnvelope, FaLock } from "react-icons/fa"; // Import icons

interface AuthProps {
  setUser: (user: any) => void;
}

const Auth: React.FC<AuthProps> = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
    } catch (error: any) {
      setError(error.message);
    }
  };

  // Email/Password Authentication
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (isSignup) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        setUser(result.user);
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        setUser(result.user);
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-200 to-blue-900">
      <div className="p-8 bg-white rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center text-black-600 mb-4">
          {isSignup ? "Create Account" : "Welcome Back "}
        </h2>

        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="flex items-center border border-black-300 p-2 rounded-lg">
            <span className="mr-2">
              <FaEnvelope size={20} color="#000000" />
            </span>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full outline-none"
              required
            />
          </div>

          <div className="flex items-center border border-black-300 p-2 rounded-lg">
            <span className="mr-2">
              <FaLock size={20} color="#000000" />
            </span>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
          >
            {isSignup ? "Sign Up" : "Login"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <p className="px-2 text-gray-500">OR</p>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
        >
          <span className="mr-2">
            <FaGoogle size={20} color="white" />
          </span>
          Sign in with Google
        </button>

        {/* Toggle Login/Signup */}
        <p className="mt-4 text-center text-sm text-gray-600">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button onClick={() => setIsSignup(!isSignup)} className="text-blue-300 underline font-semibold">
            {isSignup ? "Login" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
