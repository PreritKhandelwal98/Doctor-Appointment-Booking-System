import { Link } from "react-router-dom";

const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center">
            <div className="bg-white shadow-lg rounded-lg p-10 max-w-md">
                <h2 className="text-6xl font-bold text-blue-500 mb-4">404</h2>
                <p className="text-gray-600 text-lg mb-8">Oops, the page you're looking for doesn't exist.</p>
                <button className="bg-blue-500 text-white px-6 py-2 rounded-full transition-all hover:bg-blue-600">
                    <Link to="/">&larr; Back To Home</Link>
                </button>
            </div>
        </div>
    );
};

export default NotFound;
