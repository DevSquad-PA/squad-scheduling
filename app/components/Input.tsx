type Inputprops = React.InputHTMLAttributes<HTMLInputElement>

export default function Input({ placeholder, type, name, value, onChange }: Inputprops) {
    return (
        <input
            type={type ?? "text"}
            placeholder={placeholder}
            name={name ?? undefined}
            value={value ?? ""}
            onChange={onChange ?? undefined}
            className="bg-bg text-text border-2 border-text-muted p-1 px-2 rounded-xl text-sm w-full" />
    )
}