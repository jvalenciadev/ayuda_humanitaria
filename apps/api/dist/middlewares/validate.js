"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const validateRequest = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        }
        catch (error) {
            return res.status(400).json({
                error: 'Validación fallida',
                details: error.errors?.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })) || error.message,
            });
        }
    };
};
exports.validateRequest = validateRequest;
