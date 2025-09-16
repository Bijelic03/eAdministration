import React, {
	ReactNode,
	MouseEventHandler,
	ButtonHTMLAttributes,
} from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	children: ReactNode;
	className?: string;
	onClick?: MouseEventHandler<HTMLButtonElement>;
}

const Button: React.FC<ButtonProps> = ({
	children,
	type = 'button',
	className = '',
	onClick,
	...rest
}) => {
	return (
		<button
			type={type}
			className={`hover:cursor-pointer p-2 max-w-64 font-bold transition duration-300 hover:text-yellow-300 rounded-sm ${className}`}
			onClick={onClick}
			{...rest}
		>
			{children}
		</button>
	);
};

export default Button;
