// import React, { useState } from 'react';

// interface CustomInputProps {
//   placeholder?: string;
//   value?: string;
//   onChange?: (value: string) => void;
//   type?: 'text' | 'number';
// }

// const CustomInput: React.FC<CustomInputProps> = ({
//   placeholder = 'Введите значение',
//   value = '',
//   onChange,
//   type = 'text'
// }) => {
//   const [inputValue, setInputValue] = useState(value);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const newValue = type === 'number' 
//       ? e.target.value.replace(/\D/g, '') 
//       : e.target.value;
    
//     setInputValue(newValue);
//     onChange?.(newValue);
//   };

//   return (
//     <input
//       type={type}
//       value={inputValue}
//       onChange={handleChange}
//       placeholder={placeholder}
//       className="custom-input"
//       style={{
//         border: 'none',
//         outline: 'none',
//         backgroundColor: 'transparent',
//         fontSize: '16px',
//         padding: '8px 0',
//         width: '100%',
//         color: '#333',
//         borderBottom: '1px solid #e0e0e0', // Минималистичный разделитель
//         transition: 'border-color 0.3s ease',
//         fontFamily: 'inherit',
//         // ':focus': {
//         //   borderBottomColor: '#6200ee', // Цвет при фокусе
//         // },
//         // '::placeholder': {
//         //   color: '#999',
//         // }
//       }}
//     />
//   );
// };

// export default CustomInput;