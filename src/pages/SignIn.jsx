import { useAuth } from "../context/AuthContext";

const SignIn = () => {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Sign In</h2>
      <button 
        onClick={signInWithGoogle} 
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
      >
        Sign in with Google
      </button>
    </div>
  );
};

export default SignIn;
