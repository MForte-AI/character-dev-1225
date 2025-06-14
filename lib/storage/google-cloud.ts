import { Storage } from '@google-cloud/storage'

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || 'ps-sandbox-agent',
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
})

const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET || 'gs-team-assistant-fe-v1'
const bucket = storage.bucket(bucketName)

export interface UploadFileResult {
  fileName: string
  url: string
  size: number
  contentType: string
}

export const uploadFile = async (
  file: Buffer, 
  fileName: string, 
  contentType: string,
  folder?: string
): Promise<UploadFileResult> => {
  try {
    const fullFileName = folder ? `${folder}/${fileName}` : fileName
    const fileUpload = bucket.file(fullFileName)
    
    await fileUpload.save(file, {
      metadata: {
        contentType,
      },
    })
    
    // Generate signed URL for access (7 days expiry)
    const [signedUrl] = await fileUpload.getSignedUrl({
      action: 'read',
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
    })
    
    return {
      fileName: fullFileName,
      url: signedUrl,
      size: file.length,
      contentType,
    }
  } catch (error) {
    console.error('Error uploading file:', error)
    throw new Error('Failed to upload file')
  }
}

export const deleteFile = async (fileName: string): Promise<void> => {
  try {
    await bucket.file(fileName).delete()
  } catch (error) {
    console.error('Error deleting file:', error)
    throw new Error('Failed to delete file')
  }
}

export const getSignedUrl = async (
  fileName: string, 
  expiresInHours: number = 24
): Promise<string> => {
  try {
    const [signedUrl] = await bucket.file(fileName).getSignedUrl({
      action: 'read',
      expires: Date.now() + 1000 * 60 * 60 * expiresInHours,
    })
    
    return signedUrl
  } catch (error) {
    console.error('Error generating signed URL:', error)
    throw new Error('Failed to generate signed URL')
  }
}

export const uploadProfileImage = async (
  file: Buffer,
  userId: string,
  originalFileName: string
): Promise<UploadFileResult> => {
  const extension = originalFileName.split('.').pop()
  const fileName = `${userId}-${Date.now()}.${extension}`
  
  return uploadFile(file, fileName, 'image/jpeg', 'profile-images')
}

export const uploadMessageImage = async (
  file: Buffer,
  userId: string,
  messageId: string,
  originalFileName: string
): Promise<UploadFileResult> => {
  const extension = originalFileName.split('.').pop()
  const fileName = `${messageId}-${Date.now()}.${extension}`
  
  return uploadFile(file, fileName, 'image/jpeg', `message-images/${userId}`)
}

export const uploadDocument = async (
  file: Buffer,
  userId: string,
  originalFileName: string,
  contentType: string
): Promise<UploadFileResult> => {
  const timestamp = Date.now()
  const fileName = `${timestamp}-${originalFileName}`
  
  return uploadFile(file, fileName, contentType, `documents/${userId}`)
}

// Test connection function
export const testStorageConnection = async (): Promise<boolean> => {
  try {
    const [exists] = await bucket.exists()
    console.log(`Storage bucket ${bucketName} exists:`, exists)
    return exists
  } catch (error) {
    console.error('Storage connection test failed:', error)
    return false
  }
} 