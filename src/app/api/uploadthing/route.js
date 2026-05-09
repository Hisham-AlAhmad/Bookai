import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createRouteHandler, createUploadthing } from 'uploadthing/next'
import { UploadThingError } from 'uploadthing/server'

const uploadthingToken = process.env.UPLOADTHING_TOKEN
if (!uploadthingToken) {
  console.error('[uploadthing] Missing UPLOADTHING_TOKEN env var')
}

const f = createUploadthing()

const router = {
  imageUploader: f({
    image: { maxFileSize: '8MB', maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await getServerSession(authOptions)
      if (!session || session.user.role !== 'owner') {
        throw new UploadThingError('Unauthorized')
      }

      return { userId: session.user.id, businessId: session.user.businessId }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        uploadedBy: metadata.userId,
        businessId: metadata.businessId,
        url: file.url,
        key: file.key,
      }
    }),
}

export const { GET, POST } = createRouteHandler({
  router,
  config: {
    token: uploadthingToken,
  },
})
