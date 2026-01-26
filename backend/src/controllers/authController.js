
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

const sendEmail = require('../services/emailService');

// @desc      Register user
// @route     POST /api/auth/register
// @access    Public
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, address, collectorDetails } = req.body;
  
  let profilePicture;
  if (req.file) {
      profilePicture = req.file.path;
  }

  // Citizens are verified by default. Collectors/Recyclers need approval.
  const isVerified = role === 'citizen';

  const user = await User.create({
    name,
    email,
    password,
    role,
    phone,
    address,
    isVerified,
    profilePicture, 
    collectorDetails: role === 'collector' ? collectorDetails : undefined
  });

  // Send Welcome Email
  try {
      const message = role === 'collector' 
        ? `Hi ${user.name},\n\nThank you for applying to be a Collector at Kachrawale.\n\nYour application including vehicle details is currently UNDER REVIEW.\nYou will receive another email once an Admin verifies your documents and approves your account.\n\nCheers,\nTeam Kachrawale`
        : `Hi ${user.name},\n\nThank you for joining Kachrawale. Together we claim our clean city!\n\nRole: ${user.role}\n\nCheers,\nTeam Kachrawale`;

      await sendEmail({
          email: user.email,
          subject: role === 'collector' ? 'Kachrawale - Application Received' : 'Welcome to Kachrawale!',
          message
      });
  } catch (err) {
      console.error('Email failed:', err.message);
      // Don't fail the registration if email fails
  }

  sendTokenResponse(user, 201, res);
});

// @desc      Login user
// @route     POST /api/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  sendTokenResponse(user, 200, res);
});

// @desc      Get current logged in user
// @route     GET /api/auth/me
// @access    Private
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json(new ApiResponse(200, user));
});

// @desc      Update user details (Profile)
// @route     PUT /api/auth/updatedetails
// @access    Private
exports.updateDetails = asyncHandler(async (req, res) => {
  const fieldsToUpdate = {
    name: req.body.name,
    phone: req.body.phone,
    address: req.body.address // Optional update if sent
  };

  if (req.file) {
      fieldsToUpdate.profilePicture = req.file.path;
  }

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json(new ApiResponse(200, user, 'Profile updated successfully'));
});

// @desc      Log user out / clear cookie
// @route     GET /api/auth/logout
// @access    Private
exports.logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json(new ApiResponse(200, {}, 'Logged out successfully'));
});

// Helper: Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000 
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json(new ApiResponse(statusCode, { token, user }, 'Auth successful'));
};
