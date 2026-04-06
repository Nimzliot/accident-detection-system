import { getSupabaseAdmin } from "../config/supabase.js";

export const authenticateRequest = async (req, res, next) => {
  try {
    const header = req.headers.authorization ?? "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required"
      });
    }

    const supabase = getSupabaseAdmin();
    const {
      data: { user },
      error
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session"
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};
