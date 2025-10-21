import { Link } from "react-router-dom";
import { getMediaUrl } from "../lib/media";
import { Home, UserPlus, Bell, Briefcase, Calendar, BookOpen } from "lucide-react";

export default function Sidebar({ user }) {
	return (
		<div className='space-y-4'>
			{/* Profile Card */}
			<div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
				<div
					className='h-20 bg-cover bg-center'
					style={{
						backgroundImage: `url("${getMediaUrl(user.bannerImg) || "/banner.png"}")`,
					}}
				/>
				<div className='p-4 text-center'>
					<Link to={`/profile/${user.username}`}>
						<img
							src={getMediaUrl(user.profilePicture) || "/avatar.png"}
							alt={user.name}
							className='w-16 h-16 rounded-full mx-auto mt-[-32px] border-4 border-white'
						/>
						<h2 className='text-lg font-semibold mt-3 text-gray-800'>{user.name}</h2>
					</Link>
					<p className='text-sm text-gray-600 mt-1'>{user.headline}</p>
					<p className='text-xs text-gray-500 mt-2'>{user.connections ? user.connections.length : 0} connections</p>
				</div>
			</div>

			{/* Quick Actions */}
			<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
				<h3 className='font-semibold text-gray-800 mb-3'>Quick Actions</h3>
				<nav>
					<ul className='space-y-2'>
						<li>
							<Link
								to='/'
								className='flex items-center py-2 px-3 rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors'
							>
								<Home className='mr-3' size={20} /> Home
							</Link>
						</li>
						<li>
							<Link
								to='/network'
								className='flex items-center py-2 px-3 rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors'
							>
								<UserPlus className='mr-3' size={20} /> My Network
							</Link>
						</li>
						<li>
							<Link
								to='/notifications'
								className='flex items-center py-2 px-3 rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors'
							>
								<Bell className='mr-3' size={20} /> Notifications
							</Link>
						</li>
					</ul>
				</nav>
			</div>

			{/* Recent Activity */}
			<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
				<h3 className='font-semibold text-gray-800 mb-3'>Recent</h3>
				<div className='space-y-2'>
					<div className='flex items-center py-2 px-3 rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer'>
						<Briefcase className='mr-3' size={16} />
						<span className='text-sm'>Jobs</span>
					</div>
					<div className='flex items-center py-2 px-3 rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer'>
						<Calendar className='mr-3' size={16} />
						<span className='text-sm'>Events</span>
					</div>
					<div className='flex items-center py-2 px-3 rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer'>
						<BookOpen className='mr-3' size={16} />
						<span className='text-sm'>Learning</span>
					</div>
				</div>
			</div>
		</div>
	);
}
