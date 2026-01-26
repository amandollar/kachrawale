
const { z } = require('zod');

exports.createPickupSchema = z.object({
  wasteType: z.enum(['plastic', 'metal', 'e-waste', 'organic'], {
    errorMap: () => ({ message: 'Invalid waste type' })
  }),
  weight: z.preprocess(
      (val) => Number(val), // Preprocess: string -> number (for multipart/form-data)
      z.number().min(0.1, 'Weight must be greater than 0')
  ),
  location: z.preprocess(
      (val) => (typeof val === 'string' ? JSON.parse(val) : val), // Handle stringified JSON from form-data
      z.object({
        type: z.literal('Point'),
        coordinates: z.array(z.number()).length(2),
        formattedAddress: z.string().optional()
      })
  ).optional(), // Can use user address default
  // images/video are handled by Multer, validation logic for them stays in controller or custom logic
});
