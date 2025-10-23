import { School, X } from "lucide-react";
import { useState } from "react";

const EducationSection = ({ userData, isOwnProfile, onSave, sectionRef }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [educations, setEducations] = useState(userData.education || []);
	const [newEducation, setNewEducation] = useState({
		school: "",
		fieldOfStudy: "",
		startYear: "",
		endYear: "",
	});

	const handleAddEducation = () => {
		if (newEducation.school && newEducation.fieldOfStudy && newEducation.startYear) {
			setEducations([...educations, newEducation]);
			setNewEducation({
				school: "",
				fieldOfStudy: "",
				startYear: "",
				endYear: "",
			});
		}
	};

	const handleDeleteEducation = (id) => {
		setEducations(educations.filter((edu) => edu._id !== id));
	};

	const handleSave = () => {
		onSave({ education: educations });
		setIsEditing(false);
	};

	return (
		<div ref={sectionRef} className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6'>
			<div className='flex items-center justify-between mb-4'>
				<h2 className='text-lg font-semibold'>Education</h2>
				{isOwnProfile && (
					<button
						aria-label={isEditing ? 'Finish editing education' : 'Edit education'}
						onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
						className='text-sm text-blue-600 hover:underline'
					>
						{isEditing ? 'Done' : 'Add education'}
					</button>
				)}
			</div>

			<div className='space-y-4'>
				{educations.length === 0 && <p className='text-gray-600'>No education listed.</p>}

				{educations.map((edu) => (
					<div key={edu._id} className='flex justify-between items-start gap-4'>
						<div className='flex items-start gap-3'>
							<div className='p-2 bg-gray-100 rounded-md'>
								<School size={18} />
							</div>
							<div>
								<h3 className='font-semibold'>{edu.fieldOfStudy}</h3>
								<p className='text-gray-600'>{edu.school}</p>
								<p className='text-gray-500 text-sm'>
									{edu.startYear} - {edu.endYear || 'Present'}
								</p>
							</div>
						</div>

						{isEditing && (
							<button aria-label='Remove education' onClick={() => handleDeleteEducation(edu._id)} className='text-red-500'>
								<X size={18} />
							</button>
						)}
					</div>
				))}
			</div>

			{isEditing && (
				<div className='mt-4 border-t pt-4'>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
						<input
							type='text'
							placeholder='School'
							value={newEducation.school}
							onChange={(e) => setNewEducation({ ...newEducation, school: e.target.value })}
							className='w-full p-2 border rounded'
						/>
						<input
							type='text'
							placeholder='Field of Study'
							value={newEducation.fieldOfStudy}
							onChange={(e) => setNewEducation({ ...newEducation, fieldOfStudy: e.target.value })}
							className='w-full p-2 border rounded'
						/>
						<input
							type='number'
							placeholder='Start Year'
							value={newEducation.startYear}
							onChange={(e) => setNewEducation({ ...newEducation, startYear: e.target.value })}
							className='w-full p-2 border rounded'
						/>
						<input
							type='number'
							placeholder='End Year'
							value={newEducation.endYear}
							onChange={(e) => setNewEducation({ ...newEducation, endYear: e.target.value })}
							className='w-full p-2 border rounded'
						/>
					</div>
					<div className='mt-3 flex gap-2 justify-end'>
						<button onClick={() => setIsEditing(false)} className='px-4 py-2 border rounded'>Cancel</button>
						<button onClick={handleAddEducation} className='px-4 py-2 bg-blue-600 text-white rounded'>Add</button>
					</div>
				</div>
			)}
		</div>
	);
};
export default EducationSection;
