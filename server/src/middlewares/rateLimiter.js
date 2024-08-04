import setRateLimit from "express-rate-limit";

const rateLimiter = setRateLimit({
    windowMs:1*60*1000,
    max:300,
    message:null,
    headers:true,
    handler:async(req,res,next)=>{
        console.log(`Rate limited ${req.headers['x-forwarded-for']}`);
        return res.redirect(307, "https://www.cloudflare.com/resources/images/slt3lc6tev37/2gsdcTziAsmnUhQRiwrn5u/0f022b566241195b26d07cab66f6a90b/what_is_rate_limiting_illustration.svg");
        
}});

export default rateLimiter;
