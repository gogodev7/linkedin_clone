import { X } from "lucide-react";
import { useState } from "react";

const SkillsSection = ({ userData, isOwnProfile, onSave, sectionRef }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [skills, setSkills] = useState(userData.skills || []);
	const [newSkill, setNewSkill] = useState("");

	const handleAddSkill = () => {
		const trimmed = newSkill.trim();
		if (trimmed && !skills.includes(trimmed)) {
			setSkills([...skills, trimmed]);
			setNewSkill("");
		}
	};

	const handleDeleteSkill = (skill) => {
		setSkills(skills.filter((s) => s !== skill));
	};

	const handleSave = () => {
		onSave({ skills });
		setIsEditing(false);
	};

	return (
		<div ref={sectionRef} className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
			<div className='flex items-center justify-between mb-4'>
				<h2 className='text-lg font-semibold'>Skills</h2>
				{isOwnProfile && (
					<button
						aria-label={isEditing ? 'Finish editing skills' : 'Edit skills'}
						onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
						className='text-sm text-blue-600 hover:underline'
					>
						{isEditing ? 'Done' : 'Add skill'}
					</button>
				)}
			</div>

			<div className='flex flex-wrap gap-2'>
				{skills.length === 0 && <p className='text-gray-600'>No skills added yet.</p>}

				{skills.map((skill, index) => (
					<span
						key={index}
						className='bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center gap-2'
					>
						<span>{skill}</span>
						{isEditing && (
							<button aria-label={`Remove ${skill}`} onClick={() => handleDeleteSkill(skill)} className='text-red-500'>
								<X size={14} />
							</button>
						)}
					</span>
				))}
			</div>

			{isEditing && (
				<div className='mt-4 flex gap-2'>
					<input
						type='text'
						placeholder='Add a skill (e.g. JavaScript)'
						value={newSkill}
						onChange={(e) => setNewSkill(e.target.value)}
						className='flex-grow p-2 border rounded'
						onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
					/>
					<button
						onClick={handleAddSkill}
						className='bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200'
					>
						Add
					</button>
				</div>
			)}
		</div>
	);
};
export default SkillsSection;
