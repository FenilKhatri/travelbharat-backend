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

export const validateCreateCity = [
    body("name")
        .notEmpty().withMessage("City name is required")
        .isString().withMessage("City name must be a string")
        .trim(),
    body("stateId")
        .notEmpty().withMessage("State reference is required")
        .isMongoId().withMessage("Invalid State ID format"),
    body("description")
        .notEmpty().withMessage("Description is required")
        .isString().withMessage("Description must be a string"),
    body("type")
        .optional()
        .isIn(["city", "town", "village", "cantonment", "hill-station"])
        .withMessage("Invalid city type"),
    body("district")
        .optional()
        .isString().withMessage("District must be a string")
        .trim(),
    body("tagline")
        .optional()
        .isString().withMessage("Tagline must be a string")
        .trim(),
    body("population")
        .optional()
        .isNumeric().withMessage("Population must be a number"),
    validate
];

export const validateUpdateCity = [
    body("name")
        .optional()
        .isString().withMessage("City name must be a string")
        .trim(),
    body("stateId")
        .optional()
        .isMongoId().withMessage("Invalid State ID format"),
    body("description")
        .optional()
        .isString().withMessage("Description must be a string"),
    body("type")
        .optional()
        .isIn(["city", "town", "village", "cantonment", "hill-station"])
        .withMessage("Invalid city type"),
    body("district")
        .optional()
        .isString().withMessage("District must be a string")
        .trim(),
    body("tagline")
        .optional()
        .isString().withMessage("Tagline must be a string")
        .trim(),
    body("population")
        .optional()
        .isNumeric().withMessage("Population must be a number"),
    validate
];
