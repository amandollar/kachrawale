import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Phone, MapPin, Loader2, Briefcase, Truck, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role: 'citizen',
    vehicleNumber: '',
    licenseNumber: '',
    vehicleType: 'Truck',
    profilePicture: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
      if (user) {
          navigate('/dashboard');
      }
  }, [user, navigate]);

  const handleChange = (e) => {
    if (e.target.name === 'profilePicture') {
        setFormData({ ...formData, profilePicture: e.target.files[0] });
    } else {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('phone', formData.phone);
    data.append('address', formData.address);
    data.append('role', formData.role);

    if (formData.profilePicture) {
        data.append('profilePicture', formData.profilePicture);
    }

    if (formData.role === 'collector') {
        const collectorDetails = {
            vehicleNumber: formData.vehicleNumber,
            licenseNumber: formData.licenseNumber,
            vehicleType: formData.vehicleType
        };
        data.append('collectorDetails', JSON.stringify(collectorDetails));
    }

    const result = await register(data);
    if (result.success) {
      toast.success('Registration successful! Welcome.');
      navigate('/dashboard');
    } else {
      toast.error(result.message || 'Registration failed');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create an Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join Kachrawale today
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-2">
            
            <div className="relative">
              <User className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
              <input
                name="name"
                type="text"
                required
                className="appearance-none rounded-md relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="relative">
              <Mail className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
              <input
                name="email"
                type="email"
                required
                className="appearance-none rounded-md relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="relative">
              <Lock className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
              <input
                name="password"
                type="password"
                required
                className="appearance-none rounded-md relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="relative">
                <Phone className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                <input
                    name="phone"
                    type="text"
                    required
                    className="appearance-none rounded-md relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                />
            </div>

            <div className="relative">
                <MapPin className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                <input
                    name="address"
                    type="text"
                    required
                    className="appearance-none rounded-md relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="Address"
                    value={formData.address}
                    onChange={handleChange}
                />
            </div>

             <div className="relative">
                <Briefcase className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                <select
                    name="role"
                    className="appearance-none rounded-md relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    value={formData.role}
                    onChange={handleChange}
                >
                    <option value="citizen">Citizen</option>
                    <option value="collector">Collector</option>
                </select>
            </div>

            {formData.role === 'collector' && (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider ml-1">Vehicle Details</p>
                    <div className="relative">
                        <Truck className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                        <select
                            name="vehicleType"
                            className="appearance-none rounded-md relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            value={formData.vehicleType}
                            onChange={handleChange}
                        >
                            <option value="Truck">Truck</option>
                            <option value="Van">Van</option>
                            <option value="Rickshaw">Rickshaw</option>
                            <option value="Bike">Bike</option>
                        </select>
                    </div>

                    <div className="relative">
                        <div className="absolute top-3 left-3 h-5 w-5 flex items-center justify-center text-gray-400 font-bold text-xs border border-gray-400 rounded-sm">#</div>
                        <input
                            name="vehicleNumber"
                            type="text"
                            required
                            className="appearance-none rounded-md relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            placeholder="Vehicle Number (e.g. DL-01-AB-1234)"
                            value={formData.vehicleNumber}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="relative">
                        <FileText className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                        <input
                            name="licenseNumber"
                            type="text"
                            required
                            className="appearance-none rounded-md relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            placeholder="Driving License Number"
                            value={formData.licenseNumber}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="relative pt-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Upload Profile Picture (Required)</label>
                        <input
                            name="profilePicture"
                            type="file"
                            accept="image/*"
                            required
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            onChange={handleChange}
                        />
                    </div>
                </div>
            )}

          </div>



          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
            >
              {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Register'}
            </button>
          </div>
          
           <div className="text-center">
             <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
                  Login here
                </Link>
             </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
