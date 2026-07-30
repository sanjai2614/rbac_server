import User from "../models/User.js";

// get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      err: err.message,
    });
  }
};

// get single user
export const getSingleUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        err: "user not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      err: err.message,
    });
  }
};

// update user
export const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      msg: "user update success",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      err: err.message,
    });
  }
};

// delete user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      msg: "User deleted success",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      err: err.message,
    });
  }
};


// update profile
export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        email,
      },
      {
        new: true,
      }
    ).select("-password");

    res.status(200).json({
      success: true,
      msg: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      err: err.message,
    });
  }
};

// get user

export const getProfile=async (req,res) => {
  try {
    const user =await User.findById(req.user.id).select("-password")
    res.status(200).json({success:true,msg:"profile getted",user})

  } catch (err) {
    res.status(500).json({success:false,err:err.message})
  }
}
