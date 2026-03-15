type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    text: string
    transparent?: boolean
}

export default function Button({ text, type, onClick, transparent }: ButtonProps) {
    return (
        <button
            type={type ? type : "button"}
            onClick={onClick ? onClick : undefined}
            className={
                `${transparent ?
                    'hover:bg-primary-hover text-text border-text-muted'
                    : 'bg-primary border-primary  text-white'}
                      hover:text-white border-2 hover:bg-primary-hover hover:border-primary-hover transition duration-300 p-1 px-8 font-bold w-full cursor-pointer rounded-xl`}>
            {text}
        </button>
    )
}