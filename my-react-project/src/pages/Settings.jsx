import React, { useState } from 'react';
import { User, Lock, Languages } from 'lucide-react';

const Settings = () => {
    // State for mock user data
    const [user, setUser] = useState({
        name: 'Jane Doe',
        email: 'janedoe@gmail.com',
    });

    // State for password change form
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const handlePasswordChange = (e) => {
        e.preventDefault();
        setPasswordError('');

        if (newPassword !== confirmPassword) {
            setPasswordError("Passwords do not match.");
            return;
        }

        // Simple validation logic from the wireframe
        const hasNumber = /\d/.test(newPassword);
        const hasSpecialChar = /[!@#$%^&*()]/.test(newPassword);
        const hasCapitalLetter = /[A-Z]/.test(newPassword);
        const isCorrectLength = newPassword.length >= 8 && newPassword.length <= 64;

        if (!isCorrectLength) {
            setPasswordError("Password must be between 8 and 64 characters.");
        } else if (!hasNumber) {
            setPasswordError("Password must include a number.");
        } else if (!hasSpecialChar) {
            setPasswordError("Password must include a special character.");
        } else if (!hasCapitalLetter) {
            setPasswordError("Password must include at least one capitalized letter.");
        } else {
            // Password change is successful, you would make an API call here
            console.log("Password successfully changed!");
            setNewPassword('');
            setConfirmPassword('');
        }
    };

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-semibold text-slate-800">Settings</h1>
            
            <div className="flex flex-col md:flex-row gap-8">
                {/* User Account Details */}
                <div className="flex-1 bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold mb-4 text-slate-700 flex items-center space-x-2">
                        <User className="h-5 w-5" />
                        <span>Account Details</span>
                    </h2>
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
                        <div>
                            <p className="text-lg font-medium text-slate-900">{user.name}</p>
                            <p className="text-sm text-slate-500">{user.email}</p>
                        </div>
                        <button className="bg-gray-100 text-slate-600 py-1 px-3 rounded-lg text-sm font-semibold hover:bg-gray-200 ml-auto">
                            Edit
                        </button>
                    </div>
                </div>

                {/* Change Password Form */}
                <div className="flex-1 bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold mb-4 text-slate-700 flex items-center space-x-2">
                        <Lock className="h-5 w-5" />
                        <span>Change Password</span>
                    </h2>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700" htmlFor="new-password">New Password</label>
                            <input
                                type="password"
                                id="new-password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Enter new password"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700" htmlFor="confirm-password">Confirm Password</label>
                            <input
                                type="password"
                                id="confirm-password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Confirm new password"
                            />
                        </div>
                        <div className="text-sm text-slate-500 space-y-1">
                            <p className="flex items-center space-x-2">
                                <span className={newPassword.length >= 8 && newPassword.length <= 64 ? 'text-green-500' : 'text-gray-400'}>✔</span>
                                <span>Be between 8 to 64 characters.</span>
                            </p>
                            <p className="flex items-center space-x-2">
                                <span className={/\d/.test(newPassword) ? 'text-green-500' : 'text-gray-400'}>✔</span>
                                <span>Include a number.</span>
                            </p>
                            <p className="flex items-center space-x-2">
                                <span className={/[!@#$%^&*()]/.test(newPassword) ? 'text-green-500' : 'text-gray-400'}>✔</span>
                                <span>Include a special character ( @#$%^&*).</span>
                            </p>
                            <p className="flex items-center space-x-2">
                                <span className={/[A-Z]/.test(newPassword) ? 'text-green-500' : 'text-gray-400'}>✔</span>
                                <span>Include at least one capitalized letter.</span>
                            </p>
                        </div>
                        {passwordError && <p className="text-sm text-red-500 mt-2">{passwordError}</p>}
                        <button
                            type="submit"
                            className="bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors duration-200 mt-4"
                        >
                            Save
                        </button>
                    </form>
                </div>

                {/* Preferences Section */}
                <div className="flex-1 bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold mb-4 text-slate-700 flex items-center space-x-2">
                        <Languages className="h-5 w-5" />
                        <span>Preferences</span>
                    </h2>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Language</label>
                        <select className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                            <option>English</option>
                            <option>Spanish</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
