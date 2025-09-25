
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', ...props }) => {
  const baseClasses = "w-full font-bold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out transform focus:outline-none focus:ring-4 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:shadow-none";
  
  const variantClasses = {
    primary: "bg-green-500 text-black hover:bg-green-400 hover:shadow-lg hover:shadow-green-400/50 focus:ring-green-400 disabled:bg-gray-600",
    secondary: "bg-gray-800 text-green-300 border border-green-400/30 hover:bg-green-400/10 hover:shadow-lg hover:shadow-green-400/20 focus:ring-green-400 disabled:bg-gray-700 disabled:text-gray-500 disabled:border-gray-600"
  };

  return (
    <button
      {...props}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      {children}
    </button>
  );
};

export default Button;