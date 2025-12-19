'use client'

import { useRouter } from "next/navigation"

export default function Landing () {
    const router = useRouter()

    return (
        <div className="w-full h-full flex flex-col gap-[50px] px-[25px] py-[22px] lg:py-[143px] lg:px-[97px]">
            <div className="flex flex-col gap-[31px]">
                <span className="text-[#342222] font-montserrat font-extrabold text-4xl leading-[39px]">
                    Goedemorgen Robin!
                </span>
                <span className="text-black font-montserrat font-normal text-base leading-6 tracking-normal">
                    Vandaag een drukke dag, maar gelukkig doorstaat je planning de BKR, <br />
                    VGC en 3-uurs-checks!  🥳
                </span>
            </div>

            <div className="flex flex-col gap-[42px]">
                <span className="text-[#342222] font-montserrat font-extrabold text-md leading-[100%] tracking-normal" >Wat wil je doen?</span>
                <div className="xl:w-fit grid grid-cols-1 xl:grid-cols-2 gap-x-[23px] gap-y-[31px]">
                    <div className="w-full xl:w-[280px] h-[50px] bg-[#23BD92] rounded-lg flex flex-row justify-center items-center gap-2.5 px-[13px] py-[15px] font-montserrat font-bold text-[16px] leading-5 text-white text-center cursor-pointer"
                        onClick={() => router.push('/document')}
                    >
                        <span className="w-[221px] h-5">
                            Documentatie raadplegen
                        </span>
                    </div>

                    <div className="w-full xl:w-[280px] h-[50px] bg-[#23BD92] rounded-lg flex flex-row justify-center items-center gap-2.5 px-[13px] py-[15px] font-montserrat font-bold text-[16px] leading-5 text-white text-center cursor-pointer"
                        onClick={() => router.push('/bkr')}
                    >
                        <span className="w-[221px] h-5">
                            BKR-check doen
                        </span>
                    </div>

                    <div className="w-full xl:w-[280px] h-[50px] bg-[#23BD92] rounded-lg flex flex-row justify-center items-center gap-2.5 px-[13px] py-[15px] font-montserrat font-bold text-[16px] leading-5 text-white text-center cursor-pointer"
                        onClick={() => router.push('/vgc')}
                    >
                        <span className="w-[221px] h-5">
                            VGC-check doen
                        </span>
                    </div>

                    <div className="w-full xl:w-[280px] h-[50px] bg-[#23BD92] rounded-lg flex flex-row justify-center items-center gap-2.5 px-[13px] py-[15px] font-montserrat font-bold text-[16px] leading-5 text-white text-center cursor-pointer"
                        onClick={() => router.push('/3-uurs')}
                    >
                        <span className="w-[221px] h-5">
                            3-uurs-check doen
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}