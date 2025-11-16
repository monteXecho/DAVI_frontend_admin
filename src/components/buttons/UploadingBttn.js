export default function UploadingBttn ( {uploadedFileName} ) {
    return (
        <div className="w-fit h-[50px] mt-12 bg-[#CFE4FF] rounded-lg flex items-center gap-[10px] px-[13px] py-[15px]">
            <div className="w-[17px] h-[17px] m-auto border-4 border-t-[#4C9AFF] border-[#CFE4FF] rounded-full animate-spin"></div>
            <span className="font-montserrat font-bold text-[16px] text-[#4C9AFF]">
                {uploadedFileName || 'Document'} uploaden...
            </span>
        </div> 
    )
}
