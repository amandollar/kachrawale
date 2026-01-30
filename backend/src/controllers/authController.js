
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
    upiId: req.body.upiId, // Add UPI ID
    address,
    isVerified,
    profilePicture, 
    collectorDetails: role === 'collector' ? collectorDetails : undefined
  });

  // Send Welcome Email
  try {
      const message = role === 'collector' 
        ? `Hi ${user.name},\n\nThank you for applying to be a Collector at Clean & Green.\n\nYour application including vehicle details is currently UNDER REVIEW.\nYou will receive another email once an Admin verifies your documents and approves your account.\n\nCheers,\nTeam Clean & Green`
        : `Hi ${user.name},\n\nThank you for joining Clean & Green. Together we claim our clean city!\n\nRole: ${user.role}\n\nCheers,\nTeam Clean & Green`;

      const emailHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #059669; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Clean & Green</h1>
                <p style="color: #ecfdf5; margin: 5px 0 0; font-size: 14px;">Welcome Aboard</p>
            </div>
            
            <div style="padding: 30px; background-color: #ffffff;">
                <h2 style="color: #064e3b; margin-top: 0;">Hi ${user.name.split(' ')[0]}! 👋</h2>
                <p style="color: #4b5563; line-height: 1.6;">
                    ${role === 'collector' 
                        ? 'Thank you for applying to join our network. Your application is currently <strong>UNDER REVIEW</strong>.' 
                        : 'Thank you for joining the Clean & Green revolution! You can now request pickups, track your waste, and earn rewards.'}
                </p>

                ${role === 'collector' ? `
                <div style="background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0; color: #9a3412;">Please wait for an admin to verify your submitted documents. We will notify you once approved.</p>
                </div>
                ` : ''}

                <div style="margin-top: 30px; text-align: center;">
                    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Login to Dashboard</a>
                </div>
            </div>
             <div style="background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb;">
                &copy; ${new Date().getFullYear()} Clean & Green. All rights reserved.
            </div>
        </div>
      `;

      await sendEmail({
          email: user.email,
          subject: role === 'collector' ? 'Application Received - Clean & Green' : 'Welcome to Clean & Green!',
          message: message, // Plain text fallback
          html: emailHtml
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
    upiId: req.body.upiId,
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
