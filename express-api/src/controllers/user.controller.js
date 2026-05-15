const bcrypt = require("bcryptjs");

const supabase = require("../config/supabase");

const createUser = async (req, res) => {
  try {
    const { userId, email, password } = req.body;

    if (!userId || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "userId, email and password are required",
      });
    }

    const { data: existingEmail, error: emailError } =
      await supabase
        .from("userTable")
        .select("id")
        .eq("email", email)
        .maybeSingle();

    if (emailError) {
      return res.status(500).json({
        success: false,
        message: emailError.message,
      });
    }

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const { data: existingUserId, error: userIdError } =
      await supabase
        .from("userTable")
        .select("id")
        .eq("userId", userId)
        .maybeSingle();

    if (userIdError) {
      return res.status(500).json({
        success: false,
        message: userIdError.message,
      });
    }

    if (existingUserId) {
      return res.status(409).json({
        success: false,
        message: "UserId already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("userTable")
      .insert([
        {
          userId,
          email,
          password: hashedPassword,
        },
      ])
      .select("id, created_at, userId, email");

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, userId, password } = req.body;

    if ((!email && !userId) || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Provide email + password OR userId + password",
      });
    }

    let query = supabase
      .from("userTable")
      .select("*");

    if (email) {
      query = query.eq("email", email);
    }

    if (userId) {
      query = query.eq("userId", userId);
    }

    const { data: user, error } =
      await query.maybeSingle();

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: user.id,
        userId: user.userId,
        email: user.email,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createUser,
  loginUser,
};
