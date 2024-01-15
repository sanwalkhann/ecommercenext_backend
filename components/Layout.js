import Nav from "@/components/nav";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";

export default function Layout({ children }) {
  const [showNav, setShowNav] = useState(false);
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="bg-slate-900 flex h-screen w-screen items-center">
        <div className="text-center w-full">
          <button
            onClick={() => signIn("google")}
            className="bg-gray-400 p-2 px-4 rounded-lg"
          >
            Login with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 min-h-screen ">
      <div className="block md:hidden pl-2 pt-2">
        <button onClick={() => setShowNav(true)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
      </div>

      <div className="flex">
        <Nav show={showNav} />
        <div className="bg-white flex-grow m-2 text-black rounded-lg px-4 py-1 md:w-full">
          <div className="bg-slate-800 py-2 px-4 text-white rounded-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h2 className="items-center"> Hello, {session.user.name}</h2>
            </div>
            <div>
              <img
                src={session.user.image}
                alt=""
                className="w-10 h-10 rounded-[50%]"
              />
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
