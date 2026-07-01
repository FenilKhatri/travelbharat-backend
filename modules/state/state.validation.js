import { body, validationResult } from "express-validator";
import { errorResponse } from "../../common/utils/responseHandler.utils.js";

// Middleware to check validation results
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg);
        return errorResponse(res, 400, "Validation failed", errorMessages);
    }
    next();
};

export const validateCreateState = [
    body("name")
        .notEmpty().withMessage("State name is required")
        .isString().withMessage("State name must be a string")
        .trim(),
    body("region")
        .notEmpty().withMessage("Region is required")
        .isIn(["north", "south", "east", "west", "central", "northeast", "island"])
        .withMessage("Invalid region"),
    body("capital")
        .notEmpty().withMessage("Capital is required")
        .isString().withMessage("Capital must be a string")
        .trim(),
    validate
];

export const validateUpdateState = [
    body("name")
        .optional()
        .isString().withMessage("State name must be a string")
        .trim(),
    body("region")
        .optional()
        .isIn(["north", "south", "east", "west", "central", "northeast", "island"])
        .withMessage("Invalid region"),
    body("capital")
        .optional()
        .isString().withMessage("Capital must be a string")
        .trim(),
    validate
];
