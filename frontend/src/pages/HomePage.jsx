import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import Sidebar from "../components/Sidebar";
import PostCreation from "../components/PostCreation";
import Post from "../components/Post";
import { Users } from "lucide-react";
import RecommendedUser from "../components/RecommendedUser";

const HomePage = () => {
	const { data: authUser } = useQuery({ queryKey: ["authUser"] });

	const { data: recommendedUsers } = useQuery({
		queryKey: ["recommendedUsers"],
		queryFn: async () => {
			const res = await axiosInstance.get("/users/suggestions");
			return res.data;
		},
	});

	const { data: posts, isLoading: postsLoading, error: postsError } = useQuery({
		queryKey: ["posts"],
		queryFn: async () => {
			const res = await axiosInstance.get("/posts/all");
			return res.data;
		},
	});

	return (
		<div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
			{/* Left Sidebar */}
			<div className='hidden lg:block lg:col-span-3'>
				<div className='sticky top-20'>
					<Sidebar user={authUser} />
				</div>
			</div>

			{/* Main Feed */}
			<div className='col-span-1 lg:col-span-6'>
				<div className='space-y-4'>
					<PostCreation user={authUser} />

					{postsLoading ? (
						<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center'>
							<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
							<p className='text-gray-600'>Loading posts...</p>
						</div>
					) : postsError ? (
						<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center'>
							<div className='text-red-500 mb-4'>
								<svg className='w-16 h-16 mx-auto' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z' />
								</svg>
							</div>
							<h2 className='text-xl font-semibold mb-2 text-gray-800'>Error Loading Posts</h2>
							<p className='text-gray-600'>Please try refreshing the page.</p>
						</div>
					) : posts?.length > 0 ? (
						posts.map((post) => (
							<Post key={post._id} post={post} />
						))
					) : (
						<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center'>
							<div className='mb-6'>
								<Users size={64} className='mx-auto text-blue-500' />
							</div>
							<h2 className='text-2xl font-semibold mb-4 text-gray-800'>No Posts Yet</h2>
							<p className='text-gray-600 mb-6'>Be the first to share something!</p>
						</div>
					)}
				</div>
			</div>

			{/* Right Sidebar */}
			<div className='hidden lg:block lg:col-span-3'>
				<div className='sticky top-20 space-y-4'>
					{recommendedUsers?.length > 0 && (
						<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
							<h2 className='font-semibold text-gray-800 mb-4'>People you may know</h2>
							<div className='space-y-3'>
								{recommendedUsers?.map((user) => (
									<RecommendedUser key={user._id} user={user} />
								))}
							</div>
						</div>
					)}
					
					{/* LinkedIn-style news widget placeholder */}
					<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
						<h2 className='font-semibold text-gray-800 mb-4'>LinkedIn News</h2>
						<div className='space-y-3'>
							<div className='border-b border-gray-100 pb-3'>
								<h3 className='text-sm font-medium text-gray-800 hover:text-blue-600 cursor-pointer'>Tech industry trends</h3>
								<p className='text-xs text-gray-500 mt-1'>2,345 readers</p>
							</div>
							<div className='border-b border-gray-100 pb-3'>
								<h3 className='text-sm font-medium text-gray-800 hover:text-blue-600 cursor-pointer'>Remote work insights</h3>
								<p className='text-xs text-gray-500 mt-1'>1,892 readers</p>
							</div>
							<div className='border-b border-gray-100 pb-3'>
								<h3 className='text-sm font-medium text-gray-800 hover:text-blue-600 cursor-pointer'>Career development tips</h3>
								<p className='text-xs text-gray-500 mt-1'>3,156 readers</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
export default HomePage;
