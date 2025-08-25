const InstellingenData = [ 'Start map/document synchronisatie', 'Stop map/document synchronisatie', 'Logboek' ]

export default function Instellingen () {
    return (
        <div className="w-full h-full flex flex-col gap-[67px] px-[25px] py-[22px] lg:py-[143px] lg:px-[97px]">

            <span className="text-[#342222] font-montserrat font-extrabold text-4xl leading-[39px]">
                Instellingen
            </span>

            <div className="flex flex-col gap-[17px]">
                {
                    InstellingenData.map(data => { 
                        return (
                            <div key={data} className="w-[320px] h-[50px] bg-[#23BD92] rounded-[8px] flex flex-row justify-center items-center gap-[10px] px-[13px] py-[15px] font-montserrat font-bold text-[16px] leading-[20px] text-white text-center cursor-pointer"
                            >
                                {data}
                            </div>
                        )}
                    )
                }
{/* 
                <div className="w-[320px] h-[50px] bg-[#23BD92] rounded-[8px] flex flex-row justify-center items-center gap-[10px] px-[13px] py-[15px] font-montserrat font-bold text-[16px] leading-[20px] text-white text-center cursor-pointer"
                >
                        Stop map/document synchronisatie
                </div>

                <div className="w-[320px] h-[50px] bg-[#23BD92] rounded-[8px] flex flex-row justify-center items-center gap-[10px] px-[13px] py-[15px] font-montserrat font-bold text-[16px] leading-[20px] text-white text-center cursor-pointer"
                >
                        Logboek
                </div> */}
            </div>
        </div>
    )
}