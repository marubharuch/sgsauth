import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Visitor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-r from-blue-500 to-teal-500 text-white">
      <h1 className="text-5xl font-bold mb-4">Welcome to Family Directory</h1>
      
      <p className="text-lg mb-6 text-center max-w-md">
        {user
          ? `Welcome, ${user.name || "User"}! You can now manage your family details.`
          : "Sign in to manage your family details or explore the app as a visitor!"
        }
      </p>

      {user ? (
        <button
          onClick={() => navigate("/profile")}
          className="bg-white text-blue-600 font-semibold py-2 px-4 rounded shadow hover:bg-gray-100"
        >
          Go to Profile
        </button>
      ) : (
        <button
          onClick={() => navigate("/signin")}
          className="bg-white text-blue-600 font-semibold py-2 px-4 rounded shadow hover:bg-gray-100"
        >
          Sign In
        </button>
      )}
    </div>
  );
};

export default Visitor;
