type Inputprops = React.InputHTMLAttributes<HTMLInputElement>

export default function Input({placeholder, type, name, value,onChange}:Inputprops) {
    return(<>
     <input
     type={type?? "text"}
     placeholder={placeholder}
     name={name?? undefined}
     value={value?? ""}
     onChange={onChange?? undefined}
     className="bg-white text-gray-500 border-2 border-black p-1 px-2"/>
     </>)
}