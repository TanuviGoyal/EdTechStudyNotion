const User=require("../models/User");
const Profile=require("../models/Profile");
const Course=require("../models/Course");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

exports.updateProfile=async(req,res)=>{
    try {
        //get data
        const{dateOfBirth="",about="",contactNumber}=req.body;

        //get userid
        const id=req.user.id; //payload

        //find profile
        const userDetails=await User.findById(id);
        const profileId=userDetails.additionalDetails;
        const profileDetails=await Profile.findById(profileId);

        //update profile
        profileDetails.dateOfBirth=dateOfBirth;
        profileDetails.about=about;
        profileDetails.contactNumber=contactNumber;
        await profileDetails.save();

        //res
        return res.status(500).json({
            success:true,
            message:"profile updated successfully", 
            profileDetails,
        })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"can't update profile details due to error", 
            
        })
    }
}

exports.deleteAccount=async(req,res)=>{
    try {
        //get id
        const id=req.user.id;

        //validation
        const userDetails=await User.findById(id);
        if (!userDetails) {
            return res.status(500).json({
                success:false,
                message:"user not found", 
            })
        }

        //delete profile
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});

        //update enrolled students
        const updatedEnrolledStudents=await Course.findByIdAndUpdate(
            {_id:id},
            {
                $pull:{
                    studentsEnrolled:id,
                }
            },
            {new:true},
        )

        //delete user
        await User.findByIdAndDelete({_id:id});

        //res
        return res.status(500).json({
            success:true,
            message:"account deleted successfully", 
        })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"user not found", 
        })
    }
}

//get all users

exports.getAllUserDetails=async(req,res)=>{
    try {
        //get id
        const id=req.user.id;

        //validate and get user details
        const userDetails=await User.findById(id).populate("additionalDetails").exec();

        //res
        return res.status(500).json({
            success:true,
            message:"user details fetched", 
            userDetails,
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"cant get user details", 
        })
    }

}

exports.updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture
      const userId = req.user.id
      const image = await uploadImageToCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      )
      console.log(image)
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
      res.send({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};
  
exports.getEnrolledCourses = async (req, res) => {
    try {
      const userId = req.user.id
      const userDetails = await User.findOne({
        _id: userId,
      })
        .populate("courses")
        .exec();
      if (!userDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find user with id: ${userDetails}`,
        })
      }
      return res.status(200).json({
        success: true,
        data: userDetails.courses,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};
