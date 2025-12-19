import IssueBttn from "./buttons/IssueBttn"

export default function UploadIssueState ( {uploadedFileName} ) {
    return (
        <div className="w-full flex flex-col pt-12 gap-[43px]">
            <IssueBttn text={uploadedFileName} />

            <div className="text-[#342222] font-montserrat text-lg leading-6">
                De BKR-regeling is in de getoetste periode <span className="font-bold">niet correct</span> toegepast. 
            </div>

            <div className="font-montserrat font-normal text-base leading-[150%]">
                <br/>
                <span className="font-bold">08:00–10:30 – Babygroep &apos;Sterren&apos;</span> 
                <br/>
                Je hebt 1 beroepskracht ingepland op 5 baby&apos;s. De norm is 1 op 3.
                <br/>Advies: Voeg 1 extra medewerker toe in dit tijdblok, of verplaats baby&apos;s tijdelijk naar een andere groep met voldoende bezetting.
                <br/><br/>
                <span className="font-bold">13:00–14:30 – Peutergroep &apos;Zonnetjes&apos;</span> 
                <br/>
                Je hebt hier 3 medewerkers ingepland op 6 baby&apos;s → 1 meer extra dan nodig. 
                <br/>Advies: Je kunt overwegen om 1 medewerker tijdelijk in te zetten bij de 
                <br/>lunchbegeleiding van de peutergroep.
            </div>

            <div className="w-full h-px bg-[#C5BEBE]"></div>
        </div>
    )
}
