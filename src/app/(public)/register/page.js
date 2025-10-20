'use client';
import { useState } from "react";
import Image from "next/image";
import LogoImage from "@/assets/login-side.png";
import { useApi } from "@/lib/useApi";
import { useRouter } from "next/navigation";
import { keycloakLoginUrl } from "@/lib/keycloak";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useApi();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    passwordConfirm: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.passwordConfirm) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await register(form);

      if (!res.ok) {
        const errorMsg = res.data?.detail || "Registration failed. Please try again.";
        toast.error(errorMsg);
        return;
      }

      if (res.data.message === "Duplicate") {
        toast.error("This email is already registered. Please log in.");
        return;
      }

      toast.success("Registered successfully! Redirecting to login...");
      setTimeout(() => {
        router.push(keycloakLoginUrl);
      }, 2000);
      setForm({ fullName: "", email: "", username: "", password: "", passwordConfirm: "" });

    } catch (err) {
      console.error("Registration error:", err);
      toast.error("Unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-full items-center justify-center gap-10 bg-white px-4 py-8 md:py-0">
      
      {/* Left Form Side */}
      <div className="md:w-2/7 w-full flex flex-col justify-center gap-6">
        <div>
          <h1 className="text-6xl font-extrabold text-[#00b37e]">DAVI</h1>
        </div>

        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Voor- en achternaam"
            className="w-full h-14 px-4 border-2 border-[#23BD92] rounded-lg text-gray-700"
            required
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="E-mailadres"
            className="w-full h-14 px-4 border-2 border-[#23BD92] rounded-lg text-gray-700"
            required
          />
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Gebruikersnaam"
            className="w-full h-14 px-4 border-2 border-[#23BD92] rounded-lg text-gray-700"
            required
          />
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Wachtwoord"
            className="w-full h-14 px-4 border-2 border-[#23BD92] rounded-lg text-gray-700"
            required
          />
          <input
            type="password"
            name="passwordConfirm"
            value={form.passwordConfirm}
            onChange={handleChange}
            placeholder="Wachtwoord herhalen"
            className="w-full h-14 px-4 border-2 border-[#23BD92] rounded-lg text-gray-700"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="h-12 bg-[#00b37e] text-white font-bold rounded-lg hover:bg-green-600 transition disabled:opacity-50"
          >
            {loading ? "Registratie bezig..." : "Account activeren"}
          </button>
        </form>

        <div className="flex items-center my-8">
          <hr className="flex-1 border-gray-300" />
          <span className="mx-2 text-gray-500">OF</span>
          <hr className="flex-1 border-gray-300" />
        </div>

        <p className="text-md">
          Heb je al een account?{" "}
          <a href={keycloakLoginUrl} className="text-[#0077cc] text-lg">
            Log hier in
          </a>
        </p>
      </div>

      {/* Right Image Side */}
      <div className="flex flex-col items-center gap-8">
        <Image src={LogoImage} alt="Logo" className="w-[400px] h-[400px] object-cover shadow-lg rounded-full"/>
      </div>

      {/* Toast notifications */}
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
}
