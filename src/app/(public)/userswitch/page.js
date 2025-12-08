'use client';
import { useRouter } from "next/navigation";
import Image from "next/image";
import LogoImage from "@/assets/login-side.png";

import { useUser } from "@/lib/context/UserContext";

export default function UserSwitchPage() {
    const router = useRouter();
    const userCtx = useUser();

    if (!userCtx) {
    return null; 
    }

    const { user, roles, loading, isAuthenticated, logout } = userCtx;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Laden...</div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Geen gebruikersgegevens gevonden</div>
            </div>
        );
    }

    const { type: userType, is_teamlid, assigned_teamlid_by_name } = user;

    const handleRoleSelect = (role) => {
        router.push("/");
    };

    return (
        <div className="flex flex-col gap-20 w-full h-full justify-center items-center relative">

            {/* Background Logo */}
            <div className="absolute top-0 right-0 overflow-hidden">
                <Image
                    src={LogoImage}
                    alt="Logo"
                    className="w-[427px] h-[427px] object-cover shadow-lg rounded-full translate-x-20 -translate-y-20"
                    priority
                />
            </div>

            {/* Header */}
            <div className="flex flex-col items-center gap-3">
                <h2 className="text-[64px] font-bold text-[#23BD92] leading-none">DAVI</h2>
                <div className="text-2xl font-medium">Kies jouw rol:</div>
            </div>

            {/* Role Options */}
            <div className="flex gap-14">

                {/* Admin Role */}
                {roles.isCompanyAdmin && (
                    <RoleCard
                        label="Beheerder"
                        onClick={() => handleRoleSelect('company_admin')}
                    />
                )}

                {/* Teamlid Role */}
                {is_teamlid && assigned_teamlid_by_name && (
                    <RoleCard
                        label={`Teamlid van\n${assigned_teamlid_by_name}`}
                        onClick={() => handleRoleSelect('team_member')}
                    />
                )}

                {/* Basic User Role */}
                {(userType === 'company_user' || !is_teamlid) && (
                    <RoleCard
                        label="Gebruiker"
                        onClick={() => handleRoleSelect('company_user')}
                    />
                )}
            </div>

            {/* Logout */}
            <div
                className="flex gap-1 items-center cursor-pointer"
                onClick={logout}
            >
                <svg width="24" height="20" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 7V3L24 10L16 17V13H8V7H16ZM14 17V16.917C12.822 17.602 11.458 18 10 18C5.589 18 2 14.411 2 10C2 5.589 5.589 2 10 2C11.458 2 12.822 2.398 14 3.083V0.838C12.774 0.302 11.423 0 10 0C4.478 0 0 4.477 0 10C0 15.523 4.478 20 10 20C11.423 20 12.774 19.698 14 19.162V17Z" fill="#8F8989" />
                </svg>
                <span className="text-[#8F8989] text-[16px]">Afmelden</span>
            </div>
        </div>
    );
}

/* --- Small reusable component, cleaner UI --- */
function RoleCard({ label, onClick }) {
    return (
        <div
            className="flex flex-col items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={onClick}
        >
            {/* SVG Circle Avatar */}
            <svg width="138" height="138" viewBox="0 0 138 138" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd"
                    d="M68.1318 10.0017C100.218 10.0017 126.262 36.0458 126.262 68.1318C126.262 100.218 100.218 126.262 68.1318 126.262C36.0458 126.262 10.0017 100.218 10.0017 68.1318C10.0017 36.0458 36.0458 10.0017 68.1318 10.0017ZM68.1318 27.7789C90.4055 27.7789 108.485 45.8581 108.485 68.1318C108.485 90.4055 90.4055 108.485 68.1318 108.485C45.8581 108.485 27.7789 90.4055 27.7789 68.1318C27.7789 45.8581 45.8581 27.7789 68.1318 27.7789Z"
                    fill="#4C9AFF"
                />
                <path fillRule="evenodd" clipRule="evenodd"
                    d="M95.5956 95.0211C85.6882 92.7263 74.4218 86.8592 78.8853 78.3962C92.4789 52.6288 82.4902 38.8521 68.1356 38.8521C53.4922 38.8521 43.7476 53.1578 57.3779 78.3962C61.9796 86.908 50.3633 92.7752 40.6675 95.0211C31.818 97.0717 31.4844 101.482 31.5128 109.197L31.5291 112.089H104.738L104.75 109.286C104.779 101.519 104.482 97.0799 95.5956 95.0211Z"
                    fill="#4C9AFF"
                />
            </svg>

            {/* Label */}
            <div className="text-lg font-medium whitespace-pre-line text-center">
                {label}
            </div>
        </div>
    );
}
