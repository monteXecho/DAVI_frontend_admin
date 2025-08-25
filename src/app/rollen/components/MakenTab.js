import Toggle from "@/components/buttons/Toggle"
import AddIcon from "@/components/icons/AddIcon"
import RedCancelIcon from "@/components/icons/RedCancelIcon"

export default function MakenTab () {
    return (
        <div className="flex flex-col w-full gap-11">
            <div className="flex flex-col w-full">
                <span className="mb-2 font-montserrat font-normal text-[16px] leading-normal tracking-normal">Rolnaam</span>
                <input type="text" className="mb-5 w-1/3 h-12 rounded-[8px] border border-[#D9D9D9] px-4 py-3 focus:outline-none" />
               
                <span className="mb-2 font-montserrat font-normal text-[16px] leading-normal tracking-normal">Toegang tot map/document</span>
                <div className="flex mb-4  gap-[14px] items-center">
                    <input type="text" placeholder="//beleid" className="w-1/3 h-12 rounded-[8px] border border-[#D9D9D9] px-4 py-3 focus:outline-none" />
                    <div className="flex gap-[6px]">
                        <AddIcon />
                        <RedCancelIcon />
                    </div>
                </div>
                <div className="flex mb-4  gap-[14px] items-center">
                    <input type="text" placeholder="//kwaliteit/bkr" className="w-1/3 h-12 rounded-[8px] border border-[#D9D9D9] px-4 py-3 focus:outline-none" />
                    <div className="flex gap-[6px]">
                        <AddIcon />
                        <RedCancelIcon />
                    </div>
                </div>
            </div>

            <div className="flex flex-col w-1/3 gap-10">
                <div className="flex flex-col w-full gap-[23px]">
                    <div className="flex w-full items-center justify-between">
                        <span className="font-montserrat font-bold text-2xl leading-normal tracking-normal">AI-modules</span>
                        <Toggle checked={true}/>
                    </div>

                    {['Documentenchat', 'Vaste gezichten criterium', '3-uursregeling check', 'BKR check'].map(item => {
                        return (
                             <div key={item} className="flex w-full items-center justify-between">
                                <span className="font-montserrat font-normal text-[16px] leading-normal tracking-normal">{item}</span>
                                <Toggle checked={true}/>
                            </div>
                        )
                    })}
                </div>

                <button className="w-[95px] h-[50px] rounded-[8px] bg-[#23BD92] font-montserrat font-bold text-base leading-[100%] tracking-normal text-center text-white">
                    Opslaan
                </button>
            </div>
        </div>
    )
}