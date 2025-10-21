import Navbar from "./Navbar";

const Layout = ({ children }) => {
	return (
		<div className='min-h-screen bg-gray-50'>
			<Navbar />
			<main className='max-w-screen-2xl mx-auto px-4 py-4'>{children}</main>
		</div>
	);
};
export default Layout;
