'use client'

import { useRouter } from "next/navigation"
import Image from "next/image"
import userPhoto from '@/assets/user_photo.jpg'

export default function Header () {
    const router = useRouter()

    return (
        <div className="fixed top-0 left-0 right-0 z-50 w-full h-[90px] flex justify-between items-center px-6 bg-[#F9FBFA]">
            <div className="font-bold text-3xl leading-none tracking-normal font-montserrat text-[#23BD92] cursor-pointer"
                onClick={() => {router.push('/');}}
            >
            DAVI
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-[#23BD92] overflow-hidden">
                <Image src={userPhoto} alt="photo" className="w-full h-full object-cover" />
            </div>
        </div>
    )
}