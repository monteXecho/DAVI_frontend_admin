import SuccessBttn from "./buttons/SuccessBttn"

export default function UploadSuccessBttn ( {uploadedFileName} ) {
    return (
        <div className="w-full flex flex-col pt-12 gap-[43px]">
            <SuccessBttn text={uploadedFileName} />

            <div className="text-[#342222] font-montserrat text-lg leading-6">
                De BKR-regeling is in de getoetste periode correct toegepast!
            </div>

            <div className="w-full h-px bg-[#C5BEBE]"></div>
        </div>
    )
}
