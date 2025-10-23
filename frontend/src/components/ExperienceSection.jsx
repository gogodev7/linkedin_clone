import { Briefcase, X } from "lucide-react";
import { useState } from "react";
import { formatDate } from "../utils/dateUtils";

const ExperienceSection = ({ userData, isOwnProfile, onSave, sectionRef }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [experiences, setExperiences] = useState(userData.experience || []);
	const [newExperience, setNewExperience] = useState({
		title: "",
		company: "",
		startDate: "",
		endDate: "",
		description: "",
		currentlyWorking: false,
	});

	const handleAddExperience = () => {
		if (newExperience.title && newExperience.company && newExperience.startDate) {
			setExperiences([...experiences, newExperience]);

			setNewExperience({
				title: "",
				company: "",
				startDate: "",
				endDate: "",
				description: "",
				currentlyWorking: false,
			});
		}
	};

	const handleDeleteExperience = (id) => {
		setExperiences(experiences.filter((exp) => exp._id !== id));
	};

	const handleSave = () => {
		onSave({ experience: experiences });
		setIsEditing(false);
	};

	const handleCurrentlyWorkingChange = (e) => {
		setNewExperience({
			...newExperience,
			currentlyWorking: e.target.checked,
			endDate: e.target.checked ? "" : newExperience.endDate,
		});
	};

	return (
		<div ref={sectionRef} className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
			<div className='flex justify-between items-center mb-4'>
				<h2 className='text-lg font-semibold'>Experience</h2>
				{isOwnProfile && (
					<button
						onClick={() => {
							if (isEditing) {
								handleSave();
							} else {
								setIsEditing(true);
							}
						}}
						className='text-sm text-blue-600 hover:underline'
					>
						{isEditing ? 'Done' : 'Add experience'}
					</button>
				)}
			</div>

			<div className='space-y-4'>
				{experiences.map((exp) => (
					<div key={exp._id} className='flex justify-between items-start gap-4'>
						<div className='flex items-start gap-3'>
							<div className='p-2 bg-gray-100 rounded-md'>
								<Briefcase size={18} />
							</div>
							<div>
								<h3 className='font-semibold'>{exp.title}</h3>
								<p className='text-gray-600'>{exp.company}</p>
								<p className='text-gray-500 text-sm'>
									{formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : "Present"}
								</p>
								{exp.description && <p className='text-gray-700 mt-1'>{exp.description}</p>}
							</div>
						</div>
						{isEditing && (
							<button onClick={() => handleDeleteExperience(exp._id)} className='text-red-500'>
								<X size={20} />
							</button>
						)}
					</div>
				))}
			</div>

			{isEditing && (
				<div className='mt-4 border-t pt-4'>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
						<input type='text' placeholder='Title' value={newExperience.title} onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })} className='w-full p-2 border rounded' />
						<input type='text' placeholder='Company' value={newExperience.company} onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })} className='w-full p-2 border rounded' />
						<input type='date' placeholder='Start Date' value={newExperience.startDate} onChange={(e) => setNewExperience({ ...newExperience, startDate: e.target.value })} className='w-full p-2 border rounded' />
						{!newExperience.currentlyWorking && <input type='date' placeholder='End Date' value={newExperience.endDate} onChange={(e) => setNewExperience({ ...newExperience, endDate: e.target.value })} className='w-full p-2 border rounded' />}
					</div>
					<div className='flex items-center mt-3 gap-3'>
						<input type='checkbox' id='currentlyWorking' checked={newExperience.currentlyWorking} onChange={handleCurrentlyWorkingChange} className='mr-2' />
						<label htmlFor='currentlyWorking'>I currently work here</label>
					</div>
					<textarea placeholder='Description' value={newExperience.description} onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })} className='w-full p-2 border rounded mt-3' />
					<div className='mt-3 flex gap-2 justify-end'>
						<button onClick={() => setIsEditing(false)} className='px-4 py-2 border rounded'>Cancel</button>
						<button onClick={handleAddExperience} className='px-4 py-2 bg-blue-600 text-white rounded'>Add</button>
					</div>
				</div>
			)}

			{isOwnProfile && !isEditing && (
				<div className='mt-4'>
					<button onClick={() => setIsEditing(true)} className='text-sm text-blue-600 hover:underline'>Edit experiences</button>
				</div>
			)}
		</div>
	);
};
export default ExperienceSection;
