export const defaults = {
    /**
     * Set to ignore messages from other discord bots or not.
     */
    ignoreBots: true,

    /**
     * Default prefix for the bot.
     */
    defaultPrefix: '!',
};

import Joi from 'joi';

export const schema = Joi.object({
    ignoreBots: Joi.bool().required(),
    defaultPrefix: Joi.string().min(1).max(64).required(),
});
