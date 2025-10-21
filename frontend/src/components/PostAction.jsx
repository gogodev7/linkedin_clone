export default function PostAction({ icon, text, onClick }) {
	return (
		<button 
			className='flex items-center px-4 py-2 rounded-md hover:bg-gray-50 transition-colors' 
			onClick={onClick}
		>
			<span className='mr-2'>{icon}</span>
			<span className='text-sm font-medium'>{text}</span>
		</button>
	);
}
