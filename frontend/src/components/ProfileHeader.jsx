import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";

import { Clock, MapPin, UserCheck, UserPlus, X } from "lucide-react";
import { getMediaUrl } from "../lib/media";
import EditProfileModal from "./EditProfileModal";
import Avatar from "./Avatar";


const ProfileHeader = ({ userData, onSave, isOwnProfile }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState({});
	const queryClient = useQueryClient();

	const { data: authUser } = useQuery({ queryKey: ["authUser"] });

	const { data: connectionStatus, refetch: refetchConnectionStatus } = useQuery({
		queryKey: ["connectionStatus", userData._id],
		queryFn: () => axiosInstance.get(`/connections/status/${userData._id}`),
		enabled: !isOwnProfile,
	});

	const isConnected = userData.connections.some((connection) => connection === authUser._id);

	const { mutate: sendConnectionRequest } = useMutation({
		mutationFn: (userId) => axiosInstance.post(`/connections/request/${userId}`),
		onSuccess: () => {
			toast.success("Connection request sent");
			refetchConnectionStatus();
			queryClient.invalidateQueries(["connectionRequests"]);
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "An error occurred");
		},
	});

	const { mutate: acceptRequest } = useMutation({
		mutationFn: (requestId) => axiosInstance.put(`/connections/accept/${requestId}`),
		onSuccess: () => {
			toast.success("Connection request accepted");
			refetchConnectionStatus();
			queryClient.invalidateQueries(["connectionRequests"]);
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "An error occurred");
		},
	});

	const { mutate: rejectRequest } = useMutation({
		mutationFn: (requestId) => axiosInstance.put(`/connections/reject/${requestId}`),
		onSuccess: () => {
			toast.success("Connection request rejected");
			refetchConnectionStatus();
			queryClient.invalidateQueries(["connectionRequests"]);
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "An error occurred");
		},
	});

	const { mutate: removeConnection } = useMutation({
		mutationFn: (userId) => axiosInstance.delete(`/connections/${userId}`),
		onSuccess: () => {
			toast.success("Connection removed");
			refetchConnectionStatus();
			queryClient.invalidateQueries(["connectionRequests"]);
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "An error occurred");
		},
	});

	const getConnectionStatus = useMemo(() => {
		if (isConnected) return "connected";
		if (!isConnected) return "not_connected";
		return connectionStatus?.data?.status;
	}, [isConnected, connectionStatus]);

	const renderConnectionButton = () => {
		switch (getConnectionStatus) {
			case "connected":
				return (
					<div className='flex gap-2 justify-center'>
						<button className='bg-gray-100 text-gray-600 py-2 px-4 rounded-full font-medium flex items-center'>
							<UserCheck size={20} className='mr-2' />
							Connected
						</button>
						<button
							className='bg-gray-200 text-gray-600 py-2 px-4 rounded-full hover:bg-gray-300 transition-colors font-medium flex items-center'
							onClick={() => removeConnection(userData._id)}
						>
							<X size={20} className='mr-2' />
							Remove
						</button>
					</div>
				);

			case "pending":
				return (
					<button className='bg-gray-100 text-gray-600 py-2 px-4 rounded-full font-medium flex items-center' disabled>
						<Clock size={20} className='mr-2' />
						Pending
					</button>
				);

			case "received":
				return (
					<div className='flex gap-2 justify-center'>
						<button
							onClick={() => acceptRequest(connectionStatus.data.requestId)}
							className='bg-blue-600 text-white py-2 px-4 rounded-full hover:bg-blue-700 transition-colors font-medium'
						>
							Accept
						</button>
						<button
							onClick={() => rejectRequest(connectionStatus.data.requestId)}
							className='bg-gray-200 text-gray-600 py-2 px-4 rounded-full hover:bg-gray-300 transition-colors font-medium'
						>
							Reject
						</button>
					</div>
				);
			default:
				return (
					<button
						onClick={() => sendConnectionRequest(userData._id)}
						className='bg-blue-600 text-white py-2 px-4 rounded-full hover:bg-blue-700 transition-colors font-medium flex items-center'
					>
						<UserPlus size={20} className='mr-2' />
						Connect
					</button>
				);
		}
	};

	// Image handling and save are done by EditProfileModal; ProfilePage handles the update mutation

	return (
		<div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
			<div
				className='relative h-56 bg-cover bg-center'
				style={{
					backgroundImage: `url('${editedData.bannerImg || getMediaUrl(userData.bannerImg) || "/banner.png"}')`,
				}}
			/>

			<div className='p-6'>
				<div className='-mt-20 mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end'>
					<div className='md:col-span-2 flex items-start gap-4'>
						<div className='relative'>
							<div className='w-28 h-28 rounded-full overflow-hidden border-4 border-white'>
								<Avatar src={editedData.profilePicture || getMediaUrl(userData.profilePicture)} name={userData.name} size={112} />
							</div>
						</div>

						<div className='flex-1'>
							<h1 className='text-2xl font-semibold text-gray-800'>{userData.name}</h1>
							<p className='text-sm text-gray-600 mt-1'>{userData.headline}</p>

							<div className='flex items-center gap-4 text-sm text-gray-600 mt-3'>
								<div className='flex items-center gap-1'><MapPin size={14} className='text-gray-500' /> <span>{userData.location}</span></div>
								<div className='text-gray-500'>{userData.connections ? `${userData.connections.length} connections` : '0 connections'}</div>
							</div>
						</div>
					</div>

					<div className='md:col-span-1 flex items-end justify-end gap-2'>
						{isOwnProfile ? (
							<div className='flex items-center gap-2'>
								<button onClick={() => setIsEditing(true)} className='bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded-md hover:shadow'>Edit public profile & URL</button>
								<button onClick={() => setIsEditing(true)} className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700'>Edit profile</button>
							</div>
						) : (
							<div className='flex items-center gap-2'>
								<button className='bg-white border border-gray-200 px-3 py-2 rounded-md text-sm'>Message</button>
								{renderConnectionButton()}
								<button className='bg-white border border-gray-200 px-2 py-2 rounded-md text-sm'>•••</button>
							</div>
						)}
					</div>
				</div>
			</div>
			{isEditing && (
				<EditProfileModal
					isOpen={isEditing}
					onClose={() => setIsEditing(false)}
					userData={{ ...userData, ...editedData }}
					onSave={(data) => { setEditedData(data); onSave(data); }}
				/>
			)}
		</div>
	);
};
export default ProfileHeader;
