import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">

      <Image
        src="/aws-logo.svg" 
        alt="AWS Logo"
        width={200}
        height={100}
        className="mb-8"
      />

      {/* Portal Buttons */}
      <div className="flex gap-6">
        <Link href="/applicant">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold shadow-md hover:bg-blue-700 transition duration-300">
            Applicant Portal
          </button>
        </Link>

        <Link href="/admin">
          <button className="bg-gray-800 text-white px-6 py-3 rounded-lg text-lg font-semibold shadow-md hover:bg-gray-900 transition duration-300">
            Admin Portal
          </button>
        </Link>
      </div>
    </div>
  );
}
