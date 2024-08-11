import setRateLimit from "express-rate-limit";

const rateLimiter = setRateLimit({
    windowMs: 1 * 60 * 1000,
    max: 300,
    message: null,
    headers: true,
    handler: async (req, res, next) => {
        console.log(`Rate limited ${req.headers['x-forwarded-for']}`);
        return res.redirect(307, "https://res.cloudinary.com/dimesumyw/image/upload/v1722810329/rate_jw61fb.png");

    }
});

export default rateLimiter;