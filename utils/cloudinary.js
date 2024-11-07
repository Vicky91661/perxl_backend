// const cloudinary = require('cloudinary').v2;
// const {response} =  require('express');
// const fs= require('fs');

// const uploadImageOnCloudinary = async (localFilePath) =>{
//     try{
//         if(!localFilePath) return null
//         // upload the file on the cloudinary
//         const uploadResult = await cloudinary.uploader.upload(localFilePath,{
//             resource_type:'image',
//         })
//         const uploadResultUrl = uploadResult.url;
//         console.log("The resposne url is ",uploadResult.url);
        
//         // Optimize delivery by resizing and applying auto-format and auto-quality
//         const optimizeUrl = cloudinary.url(uploadResultUrl, {
//             fetch_format: 'auto',
//             quality: 'auto'
//         });
        
//         console.log(optimizeUrl);
        
//         // Transform the image: auto-crop to square aspect_ratio
//         const autoCropUrl = cloudinary.url(uploadResultUrl, {
//             crop: 'auto',
//             gravity: 'auto',
//             width: 500,
//             height: 500,
//         });
        
//         console.log(autoCropUrl);
//         return uploadResult;    

//     }catch(e){
//         fs.unlinkSync(localFilePath) // remove the localy saved temporary fild as the upload operation got failed
//         console.log("The error inside the cloudinary is =>",error)
//         return null;
//     }
// }

// const uploadVideoOnCloudinary = async (localFilePath) =>{
//     try{
//         if(!localFilePath) return null
//         // upload the file on the cloudinary
//         const uploadResult = await cloudinary.uploader.upload(localFilePath,{
//             resource_type:'video'
//         })

//     }catch(e){
//         console.log("The error inside the cloudinary is =>",error)
//     }
// }

// const uploadPDFOnCloudinary = async (localFilePath) =>{
//     try{
//         if(!localFilePath) return null
//         // upload the file on the cloudinary
//         const uploadResult = await cloudinary.uploader.upload(localFilePath,{
//             resource_type:'raw'
//         })

//     }catch(e){
//         console.log("The error inside the cloudinary is =>",error)
//     }
// }
// const uploadAnyFileOnCloudinary = async (localFilePath) =>{
//     try{
//         if(!localFilePath) return null
//         // upload the file on the cloudinary
//         const uploadResult = await cloudinary.uploader.upload(localFilePath,{
//             resource_type:'auto'
//         })

//     }catch(e){
//         console.log("The error inside the cloudinary is =>",error)
//     }
// }

// module.exports = {
//     uploadAnyFileOnCloudinary,
//     uploadPDFOnCloudinary,
//     uploadVideoOnCloudinary,
//     uploadImageOnCloudinary
// }

const cloudinary = require('cloudinary').v2;
const fs = require('fs');

const uploadImageOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        const uploadResult = await cloudinary.uploader.upload(localFilePath, { resource_type: 'image' });
        console.log("Image uploaded, URL:", uploadResult.url);
        return uploadResult;    
    } catch (e) {
        fs.unlinkSync(localFilePath);
        console.log("Error in uploadImageOnCloudinary:", e);
        return null;
    }
};

const uploadVideoOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        const uploadResult = await cloudinary.uploader.upload(localFilePath, { resource_type: 'video' });
        console.log("Video uploaded, URL:", uploadResult.url);
        return uploadResult;
    } catch (e) {
        fs.unlinkSync(localFilePath);
        console.log("Error in uploadVideoOnCloudinary:", e);
        return null;
    }
};

const uploadPDFOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        const uploadResult = await cloudinary.uploader.upload(localFilePath, { resource_type: 'raw' });
        console.log("PDF uploaded, URL:", uploadResult.url);
        return uploadResult;
    } catch (e) {
        fs.unlinkSync(localFilePath);
        console.log("Error in uploadPDFOnCloudinary:", e);
        return null;
    }
};

module.exports = {
    uploadImageOnCloudinary,
    uploadVideoOnCloudinary,
    uploadPDFOnCloudinary,
};
