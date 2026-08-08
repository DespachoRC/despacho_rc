interface props {
    label: string,
    htmlFor: string,
    type: string,
    name: string,
    placeHolder?: string
}

export function Input({
    label,
    htmlFor,
    type,
    name,
    placeHolder,
}: props) {

    return(
        <div className="w-full flex flex-col gap-2">
            <label htmlFor={htmlFor}>{label}</label>
            <input type={type} name={name} id={htmlFor} placeholder={placeHolder} className="border border-gray-300 rounded-xl p-3" />
        </div>
    );
}