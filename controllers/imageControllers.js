const AWS = require("aws-sdk");
const shortid = require("shortid");
const slugify = require("slugify");
require("dotenv").config();

const fs = require("fs").promises;

const {
  AWS_ACCESS_KEY,
  AWS_SECRET_KEY,
  BUCKET_NAME,
  AWS_REGION,
  AWS_CLOUDFRONT_S3_DOMAIN,
} = process.env;

// Connecting to S3
const s3 = new AWS.S3({
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_KEY,
  region: AWS_REGION,
});

exports.uploadFileToS3New = async (req, res, next) => {
  console.log("s3>>>>>>> ", s3);
  console.log("process.env>>  ", process.env);
  //req.body.fileType = "jpg";
  console.log("req>> ", req.body);
  const attachment = req.file;
  console.log("attachment>> ", attachment);
  if (!attachment) {
    return res.status(400).json({
      status: 400,
      data: {
        s3url: "",
      },
      hasError: true,
      message: "File is missing",
    });
  }
  const bucket = `${BUCKET_NAME}/images/`;
  const response = await uploadFiles(attachment);
  return res.status(200).json({
    status: 200,
    data: {
      s3url: AWS_CLOUDFRONT_S3_DOMAIN + response[0]["key"],
      s3url2: response[0]["Location"],
    },
    hasError: false,
    message: "Upload Successfully",
  });
};

const uploadFiles = async (file) => {
  let response = [];
  try {
    let fileName = `${shortid.generate()}-${slugify(file.originalname)}`;
    const res = await s3_upload(
      file.buffer,
      //bucket,
      `${BUCKET_NAME}/images`,
      fileName,
      file.mimetype
    );
    console.log("aws response>> ", res);
    response.push(res);
  } catch (err) {
    console.log(err);
  }
  return response;
};

const s3_upload = async (file, bucket, name, mimetype) => {
  const params = {
    Bucket: bucket,
    Key: String(name),
    Body: file,
    ACL: "public-read",
    ContentType: mimetype,
    ContentDisposition: "inline",
    CreateBucketConfiguration: {
      LocationConstraint: "ap-south-1",
    },
  };
  try {
    return await s3.upload(params).promise();
  } catch (e) {
    console.log(e);
  }
};
