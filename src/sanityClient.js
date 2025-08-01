// src/sanityClient.js
import sanityClient from '@sanity/client'

export default sanityClient({
    projectId: '6t2pz8vp', // replace with your real Sanity project ID
    dataset: 'production',
    useCdn: true, // faster, but doesn't show drafts
    apiVersion: '2023-01-01',
})
