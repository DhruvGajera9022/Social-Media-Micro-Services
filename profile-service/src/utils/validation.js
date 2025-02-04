const Joi = require("joi");


const validateProfile = (data) => {
    const schema = Joi.object({
        username: Joi.string().min(3).max(50).required(),
        email: Joi.string().email().required(),
    })

    return schema.validate(data)
}


module.exports = {
    validateProfile,
};