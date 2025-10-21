import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Image, Loader, Video, Calendar, Smile } from "lucide-react";
import { getMediaUrl } from "../lib/media";

const PostCreation = ({ user }) => {
	const [content, setContent] = useState("");
	const [image, setImage] = useState(null);
	const [imagePreview, setImagePreview] = useState(null);

	const queryClient = useQueryClient();

	const { mutate: createPostMutation, isPending } = useMutation({
		mutationFn: async (formData) => {
			const res = await axiosInstance.post("/posts/create", formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});
			return res.data;
		},
		onSuccess: () => {
			resetForm();
			toast.success("Post created successfully");
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		},
		onError: (err) => {
			toast.error(err.response.data.message || "Failed to create post");
		},
	});

	const handlePostCreation = async () => {
		if (!content.trim()) {
			toast.error("Please enter some content");
			return;
		}

		try {
			const formData = new FormData();
			formData.append("content", content);
			if (image) {
				formData.append("image", image);
			}
			createPostMutation(formData);
		} catch (error) {
			console.error("Error in handlePostCreation:", error);
		}
	};

	const resetForm = () => {
		setContent("");
		setImage(null);
		setImagePreview(null);
	};

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		setImage(file);
		if (file) {
			readFileAsDataURL(file).then(setImagePreview);
		} else {
			setImagePreview(null);
		}
	};

	const readFileAsDataURL = (file) => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onloadend = () => resolve(reader.result);
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	};

	return (
		<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
				<div className='flex space-x-3 mb-4'>
					<img
						src={getMediaUrl(user.profilePicture) || "/avatar.png"}
						alt={user.name}
						className='w-12 h-12 rounded-full object-cover'
					/>
				<textarea
					placeholder="What's on your mind?"
					className='flex-1 p-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors'
					value={content}
					onChange={(e) => setContent(e.target.value)}
					rows={3}
				/>
			</div>

			{imagePreview && (
				<div className='mb-4'>
					<img src={imagePreview} alt='Selected' className='w-full h-auto rounded-lg' />
				</div>
			)}

			<div className='flex justify-between items-center'>
				<div className='flex space-x-4'>
					<label className='flex items-center text-gray-600 hover:text-gray-800 transition-colors cursor-pointer'>
						<Image size={20} className='mr-2' />
						<span className='text-sm font-medium'>Photo</span>
						<input type='file' accept='image/*' className='hidden' onChange={handleImageChange} />
					</label>
					<button className='flex items-center text-gray-600 hover:text-gray-800 transition-colors'>
						<Video size={20} className='mr-2' />
						<span className='text-sm font-medium'>Video</span>
					</button>
					<button className='flex items-center text-gray-600 hover:text-gray-800 transition-colors'>
						<Calendar size={20} className='mr-2' />
						<span className='text-sm font-medium'>Event</span>
					</button>
					<button className='flex items-center text-gray-600 hover:text-gray-800 transition-colors'>
						<Smile size={20} className='mr-2' />
						<span className='text-sm font-medium'>Celebration</span>
					</button>
				</div>

				<button
					className='bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed'
					onClick={handlePostCreation}
					disabled={isPending || !content.trim()}
				>
					{isPending ? <Loader className='w-5 h-5 animate-spin' /> : "Post"}
				</button>
			</div>
		</div>
	);
};
export default PostCreation;
