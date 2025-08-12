import Image from 'next/image'

import RollenItem from '@/assets/rollen_item.png'
import GebruikersItem from '@/assets/gebruikers_item.png'
import DocumentenItem from '@/assets/documenten_item.png'

export default function HeaderAdmin () {
    return (
        <div className="flex w-full h-[63px] border-b-[1px] border-b-[#C5BEBE] pl-[50px] items-center gap-12">
            <div className='flex gap-2 items-center'>
                <div className="font-montserrat font-normal text-[#8F8989] text-[12px] leading-[100%] tracking-[0] text-center">Alle rollen</div>
                <div className='flex gap-1 items-center'>
                    <Image src={RollenItem} alt='Rollen' className='w-4 h-4 object-cover' />
                    <div className="font-montserrat font-normal text-[#8F8989] text-[12px] leading-[100%] tracking-[0] text-center">4</div>
                </div>
            </div>

            <div className='flex gap-2 items-center'>
                <div className="font-montserrat font-normal text-[#8F8989] text-[12px] leading-[100%] tracking-[0] text-center">Beheerder</div>
                <div className='flex gap-1 items-center'>
                    <Image src={GebruikersItem} alt='Rollen' className='w-4 h-4 object-cover' />
                    <div className="font-montserrat font-normal text-[#8F8989] text-[12px] leading-[100%] tracking-[0] text-center">1</div>
                </div>
                <div className='flex gap-1 items-center'>
                    <Image src={DocumentenItem} alt='Rollen' className='w-4 h-4 object-cover' />
                    <div className="font-montserrat font-normal text-[#8F8989] text-[12px] leading-[100%] tracking-[0] text-center">2256</div>
                </div>
            </div>

             <div className='flex gap-2 items-center'>
                <div className="font-montserrat font-normal text-[#8F8989] text-[12px] leading-[100%] tracking-[0] text-center">PM’er</div>
                <div className='flex gap-1 items-center'>
                    <Image src={GebruikersItem} alt='Rollen' className='w-4 h-4 object-cover' />
                    <div className="font-montserrat font-normal text-[#8F8989] text-[12px] leading-[100%] tracking-[0] text-center">201</div>
                </div>
                <div className='flex gap-1 items-center'>
                    <Image src={DocumentenItem} alt='Rollen' className='w-4 h-4 object-cover' />
                    <div className="font-montserrat font-normal text-[#8F8989] text-[12px] leading-[100%] tracking-[0] text-center">1767</div>
                </div>
            </div>

             <div className='flex gap-2 items-center'>
                <div className="font-montserrat font-normal text-[#8F8989] text-[12px] leading-[100%] tracking-[0] text-center">Staff</div>
                <div className='flex gap-1 items-center'>
                    <Image src={GebruikersItem} alt='Rollen' className='w-4 h-4 object-cover' />
                    <div className="font-montserrat font-normal text-[#8F8989] text-[12px] leading-[100%] tracking-[0] text-center">19</div>
                </div>
                <div className='flex gap-1 items-center'>
                    <Image src={DocumentenItem} alt='Rollen' className='w-4 h-4 object-cover' />
                    <div className="font-montserrat font-normal text-[#8F8989] text-[12px] leading-[100%] tracking-[0] text-center">2254</div>
                </div>
            </div>

            <div className='flex gap-2 items-center'>
                <div className="font-montserrat font-normal text-[#8F8989] text-[12px] leading-[100%] tracking-[0] text-center">PZ</div>
                <div className='flex gap-1 items-center'>
                    <Image src={GebruikersItem} alt='Rollen' className='w-4 h-4 object-cover' />
                    <div className="font-montserrat font-normal text-[#8F8989] text-[12px] leading-[100%] tracking-[0] text-center">14</div>
                </div>
                <div className='flex gap-1 items-center'>
                    <Image src={DocumentenItem} alt='Rollen' className='w-4 h-4 object-cover' />
                    <div className="font-montserrat font-normal text-[#8F8989] text-[12px] leading-[100%] tracking-[0] text-center">786</div>
                </div>
            </div>
        </div>
    )
}