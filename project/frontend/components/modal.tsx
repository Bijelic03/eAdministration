'use client';

import React from 'react';

type FullScreenModalProps = {
	isOpen: boolean;
	onClose: () => void;
	children: React.ReactNode;
};

const FullScreenModal: React.FC<FullScreenModalProps> = ({
	isOpen,
	onClose,
	children,
}) => {
	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60'>
			<div className='relative w-[95vw] h-[95vh] bg-gray-900 rounded-lg shadow-lg overflow-auto p-6'>
				<button
					onClick={onClose}
					className='hover:cursor-pointer absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl'
				>
					X
				</button>
				{children}
			</div>
		</div>
	);
};

export default FullScreenModal;

interface ModalLabelProps {
	label: string;
}
export const ModalLabel = ({ label }: ModalLabelProps) => {
	return <p className='text-2xl py-4 font-bold text-center'>{label}</p>;
};
