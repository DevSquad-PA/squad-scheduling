type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  text: string
}

export default function Button({ text, type, onClick }: ButtonProps) {
    return (
        <button
            type={type ? type : "button"}
            onClick={onClick? onClick : undefined}
            className="bg-primary hover:bg-primary-hover transition duration-300 p-1 px-8 font-bold text-white w-full cursor-pointer">
            {text}
        </button>
    )
}