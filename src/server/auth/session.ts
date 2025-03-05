import {JWT_SECRET} from "../../config.js";
import jwt from "jsonwebtoken";

export function session(req, res) {
    const token = req.cookies.session; // Get the session cookie
    // console.log(req.cookies)
    if (!token) return res.json({ session: null });


try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Token successfully verified");
    return res.json({ session: decoded });
} catch (error) {
    console.log("Token verification failed:", error.message);
    return res.json({ session: null });
}
}