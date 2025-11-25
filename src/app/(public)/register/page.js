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
    fullName: "",
    email: "",
    emailExists: "",
    emailNotFound: "",
    usernameExists: "",
    password: "",
    passwordConfirm: "",
    roleMissing: "",
  });

  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    password: false,
    passwordConfirm: false,
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    if (!email) return "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? "" : "Voer een geldig e-mailadres in.";
  };

  const validatePassword = (password) => {
    if (password.length > 0 && password.length < 6) {
      return "Wachtwoord moet minimaal 6 tekens bevatten.";
    }
    return "";
  };

  const validatePasswordConfirm = (password, passwordConfirm) => {
    if (passwordConfirm.length > 0 && password !== passwordConfirm) {
      return "De wachtwoorden komen niet overeen.";
    }
    return "";
  };

  useEffect(() => {
    if (submitted || touched.email || touched.password || touched.passwordConfirm) {
      setErrors(prev => ({
        ...prev,
        email: validateEmail(form.email),
        password: validatePassword(form.password),
        passwordConfirm: validatePasswordConfirm(form.password, form.passwordConfirm)
      }));
    }
  }, [form, touched, submitted]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    if (name === "email") {
      setErrors(prev => ({ ...prev, emailExists: "", emailNotFound: "" }));
    }
    if (name === "fullName") {
      setErrors(prev => ({ ...prev, usernameExists: "" }));
    }

    if (touched[name]) {
      setErrors(prev => ({
        ...prev,
        [name]:
          name === 'email' ? validateEmail(value) :
          name === 'password' ? validatePassword(value) :
          name === 'passwordConfirm' ? validatePasswordConfirm(form.password, value) :
          ""
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    setErrors(prev => ({
      ...prev,
      [name]:
        name === "email" ? validateEmail(form.email) :
        name === "password" ? validatePassword(form.password) :
        name === "passwordConfirm" ? validatePasswordConfirm(form.password, form.passwordConfirm) :
        ""
    }));
  };

  const parseBackendError = (errorData) => {
    console.log("🔍 Raw error data for parsing:", errorData);
    
    if (errorData?.detail) {
      console.log("📦 Found detail field:", errorData.detail);
      
      if (typeof errorData.detail === 'string') {
        if (errorData.detail.includes("User exists with same username")) {
          return "USERNAME_EXISTS";
        }
        if (errorData.detail.includes("EMAIL_EXISTS")) {
          return "EMAIL_EXISTS";
        }
        if (errorData.detail.includes("EMAIL_NOT_FOUND")) {
          return "EMAIL_NOT_FOUND";
        }
        if (errorData.detail.includes("ROLE_MISSING")) {
          return "ROLE_MISSING";
        }
      }
      return errorData.detail;
    }

    if (typeof errorData === "string") {
      console.log("📝 Processing string error:", errorData);
      
      if (errorData.includes('User exists with same username')) {
        console.log("🎯 Detected USERNAME_EXISTS from Keycloak error string");
        return "USERNAME_EXISTS";
      }
      if (errorData.includes("EMAIL_EXISTS")) {
        console.log("🎯 Detected EMAIL_EXISTS from string");
        return "EMAIL_EXISTS";
      }
      if (errorData.includes("EMAIL_NOT_FOUND")) {
        console.log("🎯 Detected EMAIL_NOT_FOUND from string");
        return "EMAIL_NOT_FOUND";
      }
      if (errorData.includes("ROLE_MISSING")) {
        console.log("🎯 Detected ROLE_MISSING from string");
        return "ROLE_MISSING";
      }
    }

    console.log("❓ Unknown error format, returning UNKNOWN_ERROR");
    return "UNKNOWN_ERROR";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    const emailError = validateEmail(form.email);
    const passwordError = validatePassword(form.password);
    const passwordConfirmError = validatePasswordConfirm(form.password, form.passwordConfirm);

    setErrors({
      fullName: "",
      email: emailError,
      password: passwordError,
      passwordConfirm: passwordConfirmError,
      emailExists: "",
      emailNotFound: "",
      usernameExists: "",
      roleMissing: ""
    });

    if (emailError || passwordError || passwordConfirmError) return;

    setLoading(true);

    try {
      const result = await register(form);
      console.log("📨 Register API result:", result);

      if (result.ok) {
        console.log("✅ Registration successful");
        setLoggedin(true);
        setForm({ fullName: "", email: "", password: "", passwordConfirm: "" });
      } else {
        const errorData = result.data;
        console.log("🚨 Registration failed with data:", errorData);
        
        const errorDetail = parseBackendError(errorData);
        console.log("🎯 Parsed error detail:", errorDetail);

        switch (errorDetail) {
          case "EMAIL_NOT_FOUND":
            console.log("📧 Handling EMAIL_NOT_FOUND");
            setErrors(prev => ({
              ...prev,
              emailNotFound: "E-mailadres niet bekend.\nVraag bij je organisatie om je uit te nodigen."
            }));
            break;
            
          case "EMAIL_EXISTS":
            console.log("📧 Handling EMAIL_EXISTS");
            setErrors(prev => ({
              ...prev,
              emailExists: "Dit e-mailadres is al geregistreerd. Log in of gebruik een ander e-mailadres."
            }));
            break;
            
          case "USERNAME_EXISTS":
            console.log("👤 Handling USERNAME_EXISTS");
            setErrors(prev => ({
              ...prev,
              usernameExists: "Deze gebruikersnaam bestaat al. Probeer een andere voor- en achternaam combinatie."
            }));
            break;
            
          case "ROLE_MISSING":
            console.log("⚙️ Handling ROLE_MISSING");
            setErrors(prev => ({
              ...prev,
              roleMissing: "Er is een configuratieprobleem bij jouw organisatie."
            }));
            toast.error("Rol niet gevonden. Neem contact op met je organisatie.");
            break;
            
          default:
            console.log("Handling UNKNOWN_ERROR. Raw data was:", errorData);
            toast.error("Registratie mislukt. Probeer het opnieuw.");
        }
      }
    } catch (error) {
      toast.error("Er is een onverwachte fout opgetreden. Probeer het later nog eens.");
    } finally {
      setLoading(false);
    }
  };

  const showEmailError = (touched.email || submitted) &&
    (errors.email || errors.emailExists || errors.emailNotFound);

  const showPasswordError = (touched.password || submitted) && errors.password;
  const showPasswordConfirmError = (touched.passwordConfirm || submitted) && errors.passwordConfirm;

  const showFullNameError = (touched.fullName || submitted) && errors.usernameExists;

  const showRoleError = errors.roleMissing;

  const getEmailErrorMessage = () => {
    if (errors.emailNotFound) return errors.emailNotFound;
    if (errors.emailExists) return errors.emailExists;
    if (errors.email) return errors.email;
    return "";
  };

  const isFormValid =
    !errors.email &&
    !errors.emailExists &&
    !errors.emailNotFound &&
    !errors.password &&
    !errors.passwordConfirm &&
    !errors.usernameExists &&
    !errors.roleMissing &&
    form.fullName.length > 0 &&
    form.email.length > 0 &&
    form.password.length >= 6 &&
    form.password === form.passwordConfirm;

  return (
    <div className="font-montserrat bg-white p-4 md:p-10 w-full min-h-screen flex items-center justify-center">

      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-6xl gap-6 md:gap-10 lg:gap-20">

        <div className="w-full md:w-1/2 max-w-md flex flex-col justify-center">

          <h1 className="text-[64px] font-bold text-[#00b37e] mb-0 leading-none">DAVI</h1>

          <div className="mb-6"></div>

          {loggedin ? (
            <div className="flex gap-5 items-center">
              <svg width="55" height="55" viewBox="0 0 55 55" fill="none">
                <path d="M27.5014 0C42.6769 0 55 12.3231 55 27.4986C55 42.6769 42.6769 55 27.5014 55C12.3231 55 0 42.6769 0 27.4986C0 12.3231 12.3231 0 27.5014 0ZM13.6132 28.5686L24.2061 38.0035C24.5966 38.3556 25.089 38.5261 25.5786 38.5261C26.1343 38.5261 26.6927 38.3033 27.097 37.8605L43.4719 19.9562C43.8322 19.5629 44.011 19.0678 44.011 18.5754C44.011 17.4476 43.1005 16.5206 41.9535 16.5206C41.3923 16.5206 40.8395 16.7462 40.4296 17.189L25.4301 33.5886L16.3583 25.5071C15.9622 25.1578 15.4754 24.9845 14.9857 24.9845C13.8442 24.9845 12.9282 25.906 12.9282 27.0365C12.9282 27.6004 13.1593 28.1615 13.6132 28.5686Z" fill="#23BD92"/>
              </svg>
              <div className="flex flex-col justify-between text-[24px] font-bold">
                <span>De registratie is gelukt!</span>
                <button onClick={() => router.push(keycloakLoginUrl)} className="text-[#0077cc] hover:underline text-left">
                  Log hier in.
                </button>
              </div>
            </div>
          ) : (

            <>
              {showRoleError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {errors.roleMissing}
                </div>
              )}

              <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit} noValidate>

                {/* FULL NAME - Now shows username exists error */}
                <div className={`relative w-full border-2 rounded-lg ${showFullNameError ? "bg-[#E94F4F] border-[#E94F4F]" : "border-[#23BD92]"}`}>
                  <input
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Voor- en achternaam"
                    className={`w-full h-[52px] px-3.5 rounded-lg text-gray-700 focus:outline-none font-normal text-base ${
                      showFullNameError ? "bg-[#F0C8C8]" : "bg-white"
                    }`}
                    required
                  />
                  {showFullNameError && (
                    <div className="text-center text-white text-sm py-2 px-4 whitespace-pre-line">
                      {errors.usernameExists}
                    </div>
                  )}
                </div>

                {/* EMAIL */}
                <div className={`relative w-full border-2 rounded-lg ${showEmailError ? "bg-[#E94F4F] border-[#E94F4F]" : "border-[#23BD92]"}`}>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="E-mailadres"
                    className={`w-full h-[52px] px-3.5 rounded-lg text-gray-700 focus:outline-none font-normal text-base ${
                      showEmailError ? "bg-[#F0C8C8]" : "bg-white"
                    }`}
                    required
                  />
                  {showEmailError && (
                    <div className="text-center text-white text-sm py-2 px-4 whitespace-pre-line">
                      {getEmailErrorMessage()}
                    </div>
                  )}
                </div>

                {/* PASSWORD */}
                <div className={`relative w-full border-2 rounded-lg ${showPasswordError ? "bg-[#E94F4F] border-[#E94F4F]" : "border-[#23BD92]"}`}>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Maak wachtwoord aan"
                    className={`w-full h-[52px] px-3.5 rounded-lg text-gray-700 focus:outline-none font-normal text-base ${
                      showPasswordError ? "bg-[#F0C8C8]" : "bg-white"
                    }`}
                    required
                    minLength={6}
                  />
                  {showPasswordError && (
                    <div className="text-center text-white text-sm py-2 px-4">
                      {errors.password}
                    </div>
                  )}
                </div>

                {/* PASSWORD CONFIRM */}
                <div className={`relative w-full border-2 rounded-lg ${showPasswordConfirmError ? "bg-[#E94F4F] border-[#E94F4F]" : "border-[#23BD92]"}`}>
                  <input
                    type="password"
                    name="passwordConfirm"
                    value={form.passwordConfirm}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Wachtwoord herhalen"
                    className={`w-full h-[52px] px-3.5 rounded-lg text-gray-700 focus:outline-none font-normal text-base ${
                      showPasswordConfirmError ? "bg-[#F0C8C8]" : "bg-white"
                    }`}
                    required
                  />
                  {showPasswordConfirmError && (
                    <div className="text-center text-white text-sm py-2 px-4">
                      {errors.passwordConfirm}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !isFormValid}
                  className="w-full h-[50px] bg-[#00b37e] text-white font-bold rounded-lg hover:bg-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base mt-2"
                >
                  {loading ? "Registratie bezig..." : "Account activeren"}
                </button>
              </form>

              <div className="flex items-center my-6 w-full">
                <hr className="flex-1 border-gray-300" />
                <span className="mx-4 text-gray-500 text-sm bg-white px-3">OF</span>
                <hr className="flex-1 border-gray-300" />
              </div>

              <p className="text-sm text-center">
                Heb je al een account?{" "}
                <a href={keycloakLoginUrl} className="text-[#0077cc] hover:underline">
                  Log hier in
                </a>
              </p>
            </>
          )}
        </div>

        <div className="w-full md:w-1/2 flex justify-center items-center">
          <Image 
            src={LogoImage} 
            alt="Logo" 
            className="w-[340px] h-[340px] object-cover shadow-lg rounded-full"
            priority
          />
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}