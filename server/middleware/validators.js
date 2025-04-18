import { body, validationResult } from 'express-validator';

// Validation rules สำหรับ username และ password
export const userValidationRules = [
  // Username validation
  body('username')
    .trim()
    .isLength({ min: 4, max: 30 })
    .withMessage('Username ต้องมีความยาว 4-30 ตัวอักษร')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username ต้องประกอบด้วยตัวอักษร a-z, A-Z, 0-9, _, - เท่านั้น'),

  // Password validation
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password ต้องมีความยาวอย่างน้อย 8 ตัวอักษร')
    .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])/)
    .withMessage('Password ต้องประกอบด้วยตัวพิมพ์ใหญ่, ตัวพิมพ์เล็ก และตัวเลข'),

  // FirstName validation
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('กรุณาระบุชื่อจริง')
    .isLength({ max: 50 })
    .withMessage('ชื่อจริงต้องไม่เกิน 50 ตัวอักษร'),

  // LastName validation
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('กรุณาระบุนามสกุล')
    .isLength({ max: 50 })
    .withMessage('นามสกุลต้องไม่เกิน 50 ตัวอักษร')
];

// Validation rules สำหรับ login
export const loginValidationRules = [
  // Username validation
  body('username')
    .trim()
    .notEmpty()
    .withMessage('กรุณาระบุ username'),

  // Password validation
  body('password')
    .notEmpty()
    .withMessage('กรุณาระบุ password')
];

// Middleware สำหรับตรวจสอบ validation errors
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  // ถ้ามี error ให้ส่งกลับไปที่ client
  return res.status(400).json({
    message: 'Validation failed',
    errors: errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }))
  });
}; 