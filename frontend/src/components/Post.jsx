import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import { Loader, MessageCircle, Send, Share2, ThumbsUp, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import PostAction from "./PostAction";
import { getMediaUrl } from "../lib/media";

const Post = ({ post }) => {
	const { postId } = useParams();

	const { data: authUser } = useQuery({ queryKey: ["authUser"] });
	const [showComments, setShowComments] = useState(false);
	const [newComment, setNewComment] = useState("");
	const [comments, setComments] = useState(post.comments || []);
	const isOwner = authUser._id === post.author._id;
	const isLiked = post.likes.includes(authUser._id);

	const queryClient = useQueryClient();

	const { mutate: deletePost, isPending: isDeletingPost } = useMutation({
		mutationFn: async () => {
			await axiosInstance.delete(`/posts/delete/${post._id}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			toast.success("Post deleted successfully");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const { mutate: createComment, isPending: isAddingComment } = useMutation({
		mutationFn: async (newComment) => {
			await axiosInstance.post(`/posts/${post._id}/comment`, { content: newComment });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			toast.success("Comment added successfully");
		},
		onError: (err) => {
			toast.error(err.response.data.message || "Failed to add comment");
		},
	});

	const { mutate: likePost, isPending: isLikingPost } = useMutation({
		mutationFn: async () => {
			await axiosInstance.post(`/posts/${post._id}/like`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			queryClient.invalidateQueries({ queryKey: ["post", postId] });
		},
	});

	const handleDeletePost = () => {
		if (!window.confirm("Are you sure you want to delete this post?")) return;
		deletePost();
	};

	const handleLikePost = async () => {
		if (isLikingPost) return;
		likePost();
	};

	const handleAddComment = async (e) => {
		e.preventDefault();
		if (newComment.trim()) {
			createComment(newComment);
			setNewComment("");
			setComments([
				...comments,
				{
					content: newComment,
					user: {
						_id: authUser._id,
						name: authUser.name,
						profilePicture: authUser.profilePicture,
					},
					createdAt: new Date(),
				},
			]);
		}
	};

	return (
		<div className='bg-white rounded-lg shadow-sm border border-gray-200'>
			<div className='p-4'>
				<div className='flex items-center justify-between mb-4'>
					<div className='flex items-center'>
												<Link to={`/profile/${post?.author?.username}`}>
													<img
														src={getMediaUrl(post.author.profilePicture) || "/avatar.png"}
														alt={post.author.name}
														className='w-12 h-12 rounded-full mr-3 object-cover'
													/>
												</Link>

						<div>
							<Link to={`/profile/${post?.author?.username}`}>
								<h3 className='font-semibold text-gray-800 hover:text-blue-600'>{post.author.name}</h3>
							</Link>
							<p className='text-sm text-gray-600'>{post.author.headline}</p>
							<p className='text-xs text-gray-500'>
								{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
							</p>
						</div>
					</div>
					{isOwner && (
						<button onClick={handleDeletePost} className='text-gray-400 hover:text-red-500 transition-colors'>
							{isDeletingPost ? <Loader size={18} className='animate-spin' /> : <Trash2 size={18} />}
						</button>
					)}
				</div>
				<p className='mb-4 text-gray-800 leading-relaxed'>{post.content}</p>
								{post.image && (
									<img src={getMediaUrl(post.image)} alt='Post content' className='rounded-lg w-full mb-4' />
								)}

				<div className='flex justify-between text-gray-600 border-t border-gray-100 pt-3'>
					<PostAction
						icon={<ThumbsUp size={20} className={isLiked ? "text-blue-600 fill-blue-600" : ""} />}
						text={`Like (${post.likes.length})`}
						onClick={handleLikePost}
					/>

					<PostAction
						icon={<MessageCircle size={20} />}
						text={`Comment (${comments.length})`}
						onClick={() => setShowComments(!showComments)}
					/>
					<PostAction icon={<Share2 size={20} />} text='Share' />
				</div>
			</div>

			{showComments && (
				<div className='px-4 pb-4 border-t border-gray-100'>
					<div className='mb-4 max-h-60 overflow-y-auto space-y-3 pt-4'>
						{comments.map((comment) => (
							<div key={comment._id} className='flex items-start space-x-3'>
																<img
																	src={getMediaUrl(comment.user.profilePicture) || "/avatar.png"}
																	alt={comment.user.name}
																	className='w-8 h-8 rounded-full flex-shrink-0 object-cover'
																/>
								<div className='flex-grow'>
									<div className='flex items-center mb-1'>
										<span className='font-semibold text-gray-800 mr-2'>{comment.user.name}</span>
										<span className='text-xs text-gray-500'>
											{formatDistanceToNow(new Date(comment.createdAt))}
										</span>
									</div>
									<p className='text-gray-700'>{comment.content}</p>
								</div>
							</div>
						))}
					</div>

					<form onSubmit={handleAddComment} className='flex items-center space-x-2'>
																<img
																	src={getMediaUrl(authUser.profilePicture) || "/avatar.png"}
																	alt={authUser.name}
																	className='w-8 h-8 rounded-full object-cover'
																/>
						<input
							type='text'
							value={newComment}
							onChange={(e) => setNewComment(e.target.value)}
							placeholder='Add a comment...'
							className='flex-grow p-3 rounded-full bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
						/>

						<button
							type='submit'
							className='bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors'
							disabled={isAddingComment}
						>
							{isAddingComment ? <Loader size={18} className='animate-spin' /> : <Send size={18} />}
						</button>
					</form>
				</div>
			)}
		</div>
	);
};
export default Post;
