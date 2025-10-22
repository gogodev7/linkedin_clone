import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { Link } from "react-router-dom";
import { Bell, Home, LogOut, User, Users, Search } from "lucide-react";
import { getMediaUrl } from '../../lib/media';
import { useState, useRef, useEffect } from "react";

const Navbar = () => {
	const { data: authUser } = useQuery({ queryKey: ["authUser"] });
	const queryClient = useQueryClient();
	const [searchQuery, setSearchQuery] = useState("");
	const [showSearchResults, setShowSearchResults] = useState(false);
	const searchRef = useRef(null);

	const { data: notifications } = useQuery({
		queryKey: ["notifications"],
		queryFn: async () => axiosInstance.get("/notifications"),
		enabled: !!authUser,
	});

	const { data: connectionRequests } = useQuery({
		queryKey: ["connectionRequests"],
		queryFn: async () => axiosInstance.get("/connections/requests"),
		enabled: !!authUser,
	});

	const { data: searchResults } = useQuery({
		queryKey: ["searchUsers", searchQuery],
		queryFn: async () => {
			if (!searchQuery.trim()) return [];
			const res = await axiosInstance.get(`/users/search?q=${encodeURIComponent(searchQuery)}`);
			return res.data;
		},
		enabled: !!searchQuery.trim(),
	});

	const { mutate: logout } = useMutation({
		mutationFn: () => axiosInstance.post("/auth/logout"),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["authUser"] });
		},
	});

	const unreadNotificationCount = (notifications?.data || []).filter((notif) => !notif.read).length;
	const unreadConnectionRequestsCount = connectionRequests?.data?.length;

	// Close search results when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (searchRef.current && !searchRef.current.contains(event.target)) {
				setShowSearchResults(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const handleSearchChange = (e) => {
		setSearchQuery(e.target.value);
		setShowSearchResults(e.target.value.trim() !== "");
	};

	const handleSearchResultClick = () => {
		setShowSearchResults(false);
		setSearchQuery("");
	};

	return (
		<nav className='bg-white border-b border-gray-200 sticky top-0 z-50'>
			<div className='max-w-screen-2xl mx-auto px-4'>
				<div className='flex justify-between items-center py-2'>
					{/* Logo */}
					<div className='flex items-center'>
						<Link to='/' className='flex items-center'>
							<img className='h-8' src='/small-logo.png' alt='LinkedIn' />
						</Link>
					</div>

					{/* Search Bar */}
					{authUser && (
						<div className='hidden md:flex flex-1 max-w-md mx-4' ref={searchRef}>
							<div className='relative w-full'>
								<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
								<input
									type='text'
									placeholder='Search'
									className='w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
									value={searchQuery}
									onChange={handleSearchChange}
								/>
								
								{/* Search Results Dropdown */}
								{showSearchResults && searchResults && (
									<div className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto'>
										{searchResults.length > 0 ? (
											searchResults.map((user) => (
												<Link
													key={user._id}
													to={`/profile/${user.username}`}
													onClick={handleSearchResultClick}
													className='flex items-center p-3 hover:bg-gray-50 transition-colors'
												>
																					<img
																						src={getMediaUrl(user.profilePicture) || "/avatar.png"}
																						alt={user.name}
																						className='w-10 h-10 rounded-full object-cover mr-3'
																					/>
													<div>
														<p className='font-medium text-gray-800'>{user.name}</p>
														<p className='text-sm text-gray-600'>{user.headline}</p>
													</div>
												</Link>
											))
										) : (
											<div className='p-3 text-gray-500 text-center'>
												No users found
											</div>
										)}
									</div>
								)}
							</div>
						</div>
					)}

					{/* Navigation Links */}
					<div className='flex items-center space-x-1'>
						{authUser ? (
							<>
								<Link 
									to={"/"} 
									className='flex flex-col items-center px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors'
								>
									<Home size={24} />
									<span className='text-xs mt-1'>Home</span>
								</Link>
								
								<Link 
									to='/network' 
									className='flex flex-col items-center px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors relative'
								>
									<Users size={24} />
									<span className='text-xs mt-1'>My Network</span>
									{unreadConnectionRequestsCount > 0 && (
										<span className='absolute top-1 right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
											{unreadConnectionRequestsCount}
										</span>
									)}
								</Link>
								
								<Link 
									to='/notifications' 
									className='flex flex-col items-center px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors relative'
								>
									<Bell size={24} />
									<span className='text-xs mt-1'>Notifications</span>
									{unreadNotificationCount > 0 && (
										<span className='absolute top-1 right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
											{unreadNotificationCount}
										</span>
									)}
								</Link>
								
								<Link
									to={`/profile/${authUser.username}`}
									className='flex flex-col items-center px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors'
								>
									<User size={24} />
									<span className='text-xs mt-1'>Me</span>
								</Link>
								
								<div className='border-l border-gray-200 mx-2 h-8'></div>
								
								<button
									className='flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors'
									onClick={() => logout()}
								>
									<LogOut size={20} />
									<span className='hidden lg:inline'>Sign Out</span>
								</button>
							</>
						) : (
							<>
								<Link 
									to='/login' 
									className='text-gray-600 hover:text-gray-900 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors'
								>
									Sign In
								</Link>
								<Link 
									to='/signup' 
									className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors'
								>
									Join now
								</Link>
							</>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
};
export default Navbar;
