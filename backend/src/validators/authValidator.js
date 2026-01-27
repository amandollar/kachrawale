
const { z } = require('zod');

exports.registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please add a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['citizen', 'collector', 'recycler', 'admin']).optional(),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  address: z.preprocess(
    (val) => {
        if (typeof val === 'string' && val.trim().startsWith('{')) {
             try { return JSON.parse(val); } catch(e) { return val; }
        }
        if (typeof val === 'string') {
            return {
                type: 'Point',
                coordinates: [0, 0], 
                formattedAddress: val
            };
        }
        // If it's an object but missing type, add it
        if (val && typeof val === 'object' && !val.type) {
            return {
                ...val,
                type: 'Point'
            };
        }
        return val;
    },
    z.object({
        type: z.literal('Point').default('Point'),
        coordinates: z.array(z.number()).length(2).default([0, 0]),
        formattedAddress: z.string().optional()
    }).optional()
  ),
  collectorDetails: z.preprocess(
    (val) => {
      if (typeof val === 'string' && val.trim().startsWith('{')) {
        try {
          return JSON.parse(val);
        } catch (e) {
          return val;
        }
      }
      return val;
    },
    z.object({
      vehicleNumber: z.string().optional(),
      licenseNumber: z.string().optional(),
      vehicleType: z.enum(['truck', 'van', 'bicycle', 'scooter']).optional()
    }).optional()
  )
});

exports.loginSchema = z.object({
  email: z.string().email('Please add a valid email'),
  password: z.string().min(1, 'Password is required')
});
