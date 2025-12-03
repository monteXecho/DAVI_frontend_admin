'use client'
import { useKeycloak } from "@react-keycloak/web";  
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import LogoImage from "@/assets/login-side.png";
import Image from "next/image";

export default function UserSwitchPage() {
    const { keycloak } = useKeycloak();
    const router = useRouter();

    const handleLogout = useCallback(() => {
        if (keycloak?.authenticated)
            keycloak.logout({ redirectUri: window.location.origin });
        else
            router.push("/");
    }, [keycloak, router]);

  return (
    <div className="flex flex-col gap-20 w-full h-full justify-center items-center relative">
        <div className="absolute top-0 right-0 overflow-hidden">
            <Image 
                src={LogoImage} 
                alt="Logo" 
                className="w-[427px] h-[427px] object-cover shadow-lg rounded-full translate-x-20 -translate-y-20"
                priority
            />
        </div>
        <div className="flex flex-col items-center gap-3">
            <h2 className="text-[64px] font-bold text-[#23BD92] leading-none">DAVI</h2>
            <div className="text-2xl font-medium">Kies jouw rol:</div>
        </div>
        <div className="flex gap-14">
            <div className="flex flex-col items-center gap-3 cursor-pointer">
                <svg width="138" height="138" viewBox="0 0 138 138" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M77.5609 0.712295L80.7579 11.6488C86.9392 13.0805 92.8387 15.53 98.2264 18.888L108.22 13.414C113.493 17.3413 118.162 22.0103 122.089 27.283L116.615 37.2765C119.973 42.6643 122.422 48.5638 123.854 54.745L134.791 57.942C135.739 64.4453 135.739 71.0578 134.791 77.5611L123.854 80.7581C122.422 86.9393 119.973 92.8388 116.615 98.2265L122.089 108.22C118.162 113.493 113.493 118.162 108.22 122.089L98.2264 116.615C92.8387 119.973 86.9392 122.423 80.7579 123.854L77.5609 134.791C71.0577 135.74 64.4452 135.74 57.9419 134.791L54.7449 123.854C48.5637 122.423 42.6642 119.973 37.2764 116.615L27.2829 122.089C22.0102 118.162 17.3412 113.493 13.4139 108.22L18.8879 98.2265C15.5299 92.8388 13.0804 86.9393 11.6487 80.7581L0.712173 77.5611C-0.236577 71.0578 -0.236577 64.4453 0.712173 57.942L11.6487 54.745C13.0804 48.5638 15.5299 42.6643 18.8879 37.2765L13.4139 27.283C17.3412 22.0103 22.0102 17.3413 27.2829 13.414L37.2764 18.888C42.6642 15.53 48.5637 13.0805 54.7449 11.6488L57.9419 0.712295C64.4452 -0.236455 71.0577 -0.236455 77.5609 0.712295ZM67.7514 25.9605C90.8147 25.9605 109.542 44.6883 109.542 67.7515C109.542 90.8148 90.8147 109.543 67.7514 109.543C44.6882 109.543 25.9604 90.8148 25.9604 67.7515C25.9604 44.6883 44.6882 25.9605 67.7514 25.9605Z" fill="#4C9AFF"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M94.9342 94.3655C85.1284 92.0943 73.9774 86.2872 78.3951 77.911C91.8495 52.4076 81.9631 38.772 67.7556 38.772C53.2622 38.772 43.6174 52.9311 57.1081 77.911C61.6627 86.3356 50.1654 92.1426 40.5689 94.3655C31.8101 96.3952 31.4799 100.76 31.5081 108.396L31.5242 111.259H103.983L103.995 108.484C104.023 100.797 103.729 96.4032 94.9342 94.3655Z" fill="#4C9AFF"/>
                </svg>
                <div className="text-lg font-medium">Beheerder</div>
            </div>
            <div className="flex flex-col items-center gap-3 cursor-pointer">
                <svg width="138" height="138" viewBox="0 0 138 138" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M68.1318 10.0017C100.218 10.0017 126.262 36.0458 126.262 68.1318C126.262 100.218 100.218 126.262 68.1318 126.262C36.0458 126.262 10.0017 100.218 10.0017 68.1318C10.0017 36.0458 36.0458 10.0017 68.1318 10.0017ZM68.1318 27.7789C90.4055 27.7789 108.485 45.8581 108.485 68.1318C108.485 90.4055 90.4055 108.485 68.1318 108.485C45.8581 108.485 27.7789 90.4055 27.7789 68.1318C27.7789 45.8581 45.8581 27.7789 68.1318 27.7789Z" fill="#4C9AFF"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M95.5956 95.0211C85.6882 92.7263 74.4218 86.8592 78.8853 78.3962C92.4789 52.6288 82.4902 38.8521 68.1356 38.8521C53.4922 38.8521 43.7476 53.1578 57.3779 78.3962C61.9796 86.908 50.3633 92.7752 40.6675 95.0211C31.818 97.0717 31.4844 101.482 31.5128 109.197L31.5291 112.089H104.738L104.75 109.286C104.779 101.519 104.482 97.0799 95.5956 95.0211Z" fill="#4C9AFF"/>
                </svg>
                <div className="text-lg font-medium">Teamlid van<br /> Piet Janssen</div>
            </div>
            <div className="flex flex-col items-center gap-3 cursor-pointer">
                <svg width="138" height="138" viewBox="0 0 138 138" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M68.1318 10.0017C100.218 10.0017 126.262 36.0458 126.262 68.1318C126.262 100.218 100.218 126.262 68.1318 126.262C36.0458 126.262 10.0017 100.218 10.0017 68.1318C10.0017 36.0458 36.0458 10.0017 68.1318 10.0017ZM68.1318 27.7789C90.4055 27.7789 108.485 45.8581 108.485 68.1318C108.485 90.4055 90.4055 108.485 68.1318 108.485C45.8581 108.485 27.7789 90.4055 27.7789 68.1318C27.7789 45.8581 45.8581 27.7789 68.1318 27.7789Z" fill="#4C9AFF"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M95.5956 95.0211C85.6882 92.7263 74.4218 86.8592 78.8853 78.3962C92.4789 52.6288 82.4902 38.8521 68.1356 38.8521C53.4922 38.8521 43.7476 53.1578 57.3779 78.3962C61.9796 86.908 50.3633 92.7752 40.6675 95.0211C31.818 97.0717 31.4844 101.482 31.5128 109.197L31.5291 112.089H104.738L104.75 109.286C104.779 101.519 104.482 97.0799 95.5956 95.0211Z" fill="#4C9AFF"/>
                </svg>
                <div className="text-lg font-medium">Teamlid van<br /> John de Wit</div>
            </div>
        </div>
        <div className="flex gap-1 items-center cursor-pointer" onClick={handleLogout}>
            <svg width="24" height="20" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 7V3L24 10L16 17V13H8V7H16ZM14 17V16.917C12.822 17.602 11.458 18 10 18C5.589 18 2 14.411 2 10C2 5.589 5.589 2 10 2C11.458 2 12.822 2.398 14 3.083V0.838C12.774 0.302 11.423 0 10 0C4.478 0 0 4.477 0 10C0 15.523 4.478 20 10 20C11.423 20 12.774 19.698 14 19.162V17Z" fill="#8F8989"/>
            </svg>
            <span className="text-[#8F8989] text-[16px]">Afmelden</span>
        </div>
    </div>
  );
}
