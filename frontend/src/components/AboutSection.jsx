import { useState } from "react";

const AboutSection = ({ userData, isOwnProfile, onSave, sectionRef }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [about, setAbout] = useState(userData.about || "");

	const handleSave = () => {
		setIsEditing(false);
		onSave({ about });
	};

	return (
		<div ref={sectionRef} className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
			<div className='flex justify-between items-start mb-4'>
				<h2 className='text-lg font-semibold'>About</h2>
				{isOwnProfile && !isEditing && (
					<button onClick={() => setIsEditing(true)} className='text-sm text-blue-600 hover:underline'>Edit</button>
				)}
			</div>

			{isEditing ? (
				<>
					<textarea value={about} onChange={(e) => setAbout(e.target.value)} className='w-full p-3 border rounded mb-3' rows='5' />
					<div className='flex gap-2 justify-end'>
						<button onClick={() => setIsEditing(false)} className='px-4 py-2 border rounded'>Cancel</button>
						<button onClick={handleSave} className='px-4 py-2 bg-blue-600 text-white rounded'>Save</button>
					</div>
				</>
			) : (
				<p className='text-gray-700 leading-relaxed'>{userData.about || 'No summary provided.'}</p>
			)}
		</div>
	);
};
export default AboutSection;
