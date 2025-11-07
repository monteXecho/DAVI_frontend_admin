'use client';
import { useState, useEffect } from "react";
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
  const [loggedin, setLoggedin] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    emailExists: "", // For duplicate email
    emailNotFound: "", // New error for email not found in DB
    passwordConfirm: "",
  });

  const [touched, setTouched] = useState({
    email: false,
    passwordConfirm: false,
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Validation functions
  const validateEmail = (email) => {
    if (email.length === 0) return "";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Voer een geldig e-mailadres in.";
    }
    return "";
  };

  const validatePasswordConfirm = (password, passwordConfirm) => {
    if (passwordConfirm.length > 0 && password !== passwordConfirm) {
      return "De wachtwoorden komen niet overeen.";
    }
    return "";
  };

  // Validate on form submission and when fields are touched
  useEffect(() => {
    if (submitted || touched.email || touched.passwordConfirm) {
      setErrors(prev => ({
        ...prev,
        email: validateEmail(form.email),
        passwordConfirm: validatePasswordConfirm(form.password, form.passwordConfirm),
        // Clear email errors when user starts typing again
        emailExists: prev.emailExists && form.email !== prev.lastEmail ? "" : prev.emailExists,
        emailNotFound: prev.emailNotFound && form.email !== prev.lastEmail ? "" : prev.emailNotFound
      }));
    }
  }, [form, touched, submitted]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    // Clear email errors when user starts typing
    if (name === 'email' && (errors.emailExists || errors.emailNotFound)) {
      setErrors(prev => ({
        ...prev,
        emailExists: "",
        emailNotFound: ""
      }));
    }

    // Only validate immediately if the field has been touched before
    if (touched[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: 
          name === 'email' ? validateEmail(value) :
          name === 'passwordConfirm' ? validatePasswordConfirm(form.password, value) :
          ""
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    // Validate the blurred field
    setErrors(prev => ({
      ...prev,
      [name]: 
        name === 'email' ? validateEmail(form.email) :
        name === 'passwordConfirm' ? validatePasswordConfirm(form.password, form.passwordConfirm) :
        ""
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    // Validate all fields on submit
    const emailError = validateEmail(form.email);
    const passwordConfirmError = validatePasswordConfirm(form.password, form.passwordConfirm);

    setErrors({
      email: emailError,
      emailExists: "", // Reset email errors on new submission
      emailNotFound: "",
      passwordConfirm: passwordConfirmError,
    });

    // Check if there are any validation errors
    if (emailError || passwordConfirmError) {
      return;
    }

    setLoading(true);

    try {
      const res = await register(form);

      if (!res.ok) {
        const errorMsg = res.data?.detail || "Registration failed. Please try again.";
        
        // Check if it's a duplicate email error
        if (res.data.message === "Duplicate" || errorMsg.toLowerCase().includes("already exists") || errorMsg.toLowerCase().includes("duplicate")) {
          setErrors(prev => ({
            ...prev,
            emailExists: "Dit e-mailadres is al geregistreerd. Log in of gebruik een ander e-mailadres."
          }));
          return;
        }
        
        // Check if email not found in database
        if (errorMsg.toLowerCase().includes("email not found") || errorMsg.toLowerCase().includes("not found")) {
          setErrors(prev => ({
            ...prev,
            emailNotFound: "E-mailadres niet bekend.\nVraag bij je organisatie om je uit te nodigen."
          }));
          return;
        }
        
        // For other errors, show toast
        toast.error(errorMsg);
        return;
      }

      // Registration successful - show success UI instead of toast
      setLoggedin(true);
      setForm({ fullName: "", email: "", password: "", passwordConfirm: "" });

    } catch (err) {
      console.error("Registration error:", err);
      
      // Handle specific error cases from the backend
      if (err.response?.data?.detail?.toLowerCase().includes("email not found") || 
          err.response?.data?.detail?.toLowerCase().includes("not found")) {
        setErrors(prev => ({
          ...prev,
          emailNotFound: "E-mailadres niet bekend.\nVraag bij je organisatie om je uit te nodigen."
        }));
      } else {
        toast.error("Unexpected error occurred. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = () => {
    router.push(keycloakLoginUrl);
  };

  const showEmailError = (touched.email || submitted) && (errors.email || errors.emailExists || errors.emailNotFound);
  const showPasswordError = (touched.passwordConfirm || submitted) && errors.passwordConfirm;

  // Determine which email error message to show
  const getEmailErrorMessage = () => {
    if (errors.emailNotFound) return errors.emailNotFound;
    if (errors.emailExists) return errors.emailExists;
    if (errors.email) return errors.email;
    return "";
  };

  // Check if form is valid for submit button
  const isFormValid = !errors.email && !errors.emailExists && !errors.emailNotFound && !errors.passwordConfirm && 
                     form.email.length > 0 && validateEmail(form.email) === "" &&
                     form.password === form.passwordConfirm;

  return (
    <div className="font-montserrat bg-white p-4 md:p-10 w-full min-h-screen flex items-center justify-center">
      
      {/* Main Container */}
      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-6xl gap-6 md:gap-10 lg:gap-20">
        
        {/* Form Side */}
        <div className="w-full md:w-1/2 max-w-md flex flex-col justify-center">
          {/* Brand */}
          <h1 className="text-[64px] font-bold text-[#00b37e] mb-0 leading-none">DAVI</h1>
          
          {/* Spacing like the HTML version */}
          <div className="mb-6"></div>

          {/* Success UI - Show when registration is successful */}
          {loggedin ? (
            <div className="flex gap-5 items-center">
              <svg width="55" height="55" viewBox="0 0 55 55" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M27.5014 0C42.6769 0 55 12.3231 55 27.4986C55 42.6769 42.6769 55 27.5014 55C12.3231 55 0 42.6769 0 27.4986C0 12.3231 12.3231 0 27.5014 0ZM13.6132 28.5686L24.2061 38.0035C24.5966 38.3556 25.089 38.5261 25.5786 38.5261C26.1343 38.5261 26.6927 38.3033 27.097 37.8605L43.4719 19.9562C43.8322 19.5629 44.011 19.0678 44.011 18.5754C44.011 17.4476 43.1005 16.5206 41.9535 16.5206C41.3923 16.5206 40.8395 16.7462 40.4296 17.189L25.4301 33.5886L16.3583 25.5071C15.9622 25.1578 15.4754 24.9845 14.9857 24.9845C13.8442 24.9845 12.9282 25.906 12.9282 27.0365C12.9282 27.6004 13.1593 28.1615 13.6132 28.5686Z" fill="#23BD92"/>
              </svg>
              <div className="flex flex-col justify-between text-[24px] font-bold">
                <span>
                  De registratie is gelukt!
                </span>
                <button 
                  onClick={handleLoginClick}
                  className="text-[#0077cc] hover:underline text-left"
                >
                  Log hier in.
                </button>              
              </div>
            </div>
          ) : (
            <>
              {/* Registration Form - Show when not logged in */}
              <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
                {/* Full Name */}
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Voor- en achternaam"
                  className="w-full h-[52px] px-[14px] border-2 border-[#23BD92] rounded-lg text-gray-700 focus:outline-none focus:border-[#00b37e] font-normal text-base"
                  required
                />
                
                {/* Email Input */}
                <div className={`relative w-full border-2 rounded-lg ${showEmailError ? "bg-[#E94F4F] border-[#E94F4F]" : "border-[#23BD92]"}`}>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="E-mailadres"
                    className={`w-full h-[52px] px-[14px] rounded-lg text-gray-700 focus:outline-none font-normal text-base ${
                      showEmailError ? "bg-[#F0C8C8] border-0" : "bg-white focus:border-[#00b37e]"
                    }`}
                    required
                  />
                  {showEmailError && (
                    <>
                      <div className="absolute top-3 right-4 pointer-events-none">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9.997 19.995C15.515 19.995 19.995 15.515 19.995 9.997C19.995 4.479 15.515 0 9.997 0C4.48 0 0 4.479 0 9.997C0 15.515 4.48 19.995 9.997 19.995ZM9.997 11.995C9.583 11.995 9.247 11.659 9.247 11.245V5.745C9.247 5.331 9.583 4.995 9.997 4.995C10.411 4.995 10.747 5.331 10.747 5.745V11.245C10.747 11.659 10.411 11.995 9.997 11.995ZM9.995 14.995C9.443 14.995 8.995 14.547 8.995 13.995C8.995 13.443 9.443 12.995 9.995 12.995C10.547 12.995 10.995 13.443 10.995 13.995C10.995 14.547 10.547 14.995 9.995 14.995Z" fill="#E94F4F"/>
                        </svg>
                      </div>
                      <div className="text-center text-white text-sm py-2 px-4 whitespace-pre-line">
                        {getEmailErrorMessage()}
                      </div>
                    </>
                  )}
                </div>

                {/* Password */}
                <div className={`relative w-full border-2 rounded-lg ${showPasswordError ? "bg-[#E94F4F] border-[#E94F4F]" : "border-[#23BD92]"}`}>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Maak wachtwoord aan"
                    className={`w-full h-[52px] px-[14px] rounded-lg text-gray-700 focus:outline-none font-normal text-base ${
                      showPasswordError ? "bg-[#F0C8C8] border-0" : "bg-white focus:border-[#00b37e]"
                    }`}
                    required
                    minLength={6}
                  />
                  {showPasswordError && (
                    <>
                      <div className="absolute top-3 right-4 pointer-events-none">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9.997 19.995C15.515 19.995 19.995 15.515 19.995 9.997C19.995 4.479 15.515 0 9.997 0C4.48 0 0 4.479 0 9.997C0 15.515 4.48 19.995 9.997 19.995ZM9.997 11.995C9.583 11.995 9.247 11.659 9.247 11.245V5.745C9.247 5.331 9.583 4.995 9.997 4.995C10.411 4.995 10.747 5.331 10.747 5.745V11.245C10.747 11.659 10.411 11.995 9.997 11.995ZM9.995 14.995C9.443 14.995 8.995 14.547 8.995 13.995C8.995 13.443 9.443 12.995 9.995 12.995C10.547 12.995 10.995 13.443 10.995 13.995C10.995 14.547 10.547 14.995 9.995 14.995Z" fill="#E94F4F"/>
                        </svg>
                      </div>
                    </>
                  )}
                </div>

                {/* Password Confirm */}
                <div className={`relative w-full border-2 rounded-lg ${showPasswordError ? "bg-[#E94F4F] border-[#E94F4F]" : "border-[#23BD92]"}`}>
                  <input
                    type="password"
                    name="passwordConfirm"
                    value={form.passwordConfirm}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Wachtwoord herhalen"
                    className={`w-full h-[52px] px-[14px] rounded-lg text-gray-700 focus:outline-none font-normal text-base ${
                      showPasswordError ? "bg-[#F0C8C8] border-0" : "bg-white focus:border-[#00b37e]"
                    }`}
                    required
                  />
                  {showPasswordError && (
                    <>
                      <div className="absolute top-3 right-4 pointer-events-none">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9.997 19.995C15.515 19.995 19.995 15.515 19.995 9.997C19.995 4.479 15.515 0 9.997 0C4.48 0 0 4.479 0 9.997C0 15.515 4.48 19.995 9.997 19.995ZM9.997 11.995C9.583 11.995 9.247 11.659 9.247 11.245V5.745C9.247 5.331 9.583 4.995 9.997 4.995C10.411 4.995 10.747 5.331 10.747 5.745V11.245C10.747 11.659 10.411 11.995 9.997 11.995ZM9.995 14.995C9.443 14.995 8.995 14.547 8.995 13.995C8.995 13.443 9.443 12.995 9.995 12.995C10.547 12.995 10.995 13.443 10.995 13.995C10.995 14.547 10.547 14.995 9.995 14.995Z" fill="#E94F4F"/>
                        </svg>
                      </div>
                      <div className="text-center text-white text-sm py-2 px-4">
                        {errors.passwordConfirm}
                      </div>
                    </>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !isFormValid}
                  className="w-full h-[50px] bg-[#00b37e] text-white font-bold rounded-lg hover:bg-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base mt-2"
                >
                  {loading ? "Registratie bezig..." : "Account activeren"}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center my-6 w-full">
                <hr className="flex-1 border-gray-300" />
                <span className="mx-4 text-gray-500 text-sm bg-white px-3">OF</span>
                <hr className="flex-1 border-gray-300" />
              </div>

              {/* Login Link */}
              <p className="text-sm text-center">
                Heb je al een account?{" "}
                <a href={keycloakLoginUrl} className="text-[#0077cc] text-sm hover:underline">
                  Log hier in
                </a>
              </p>
            </>
          )}
        </div>

        {/* Image Side */}
        <div className="w-full md:w-1/2 flex justify-center items-center">
          <Image 
            src={LogoImage} 
            alt="Logo" 
            className="w-[340px] h-[340px] object-cover shadow-lg rounded-full"
            priority
          />
        </div>
      </div>

      {/* Toast notifications */}
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
}