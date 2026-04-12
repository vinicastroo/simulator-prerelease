/** @type {import('next').NextConfig} */
const cloudfrontHostname = process.env.NEXT_PUBLIC_CARD_CDN_HOSTNAME;
const s3BucketHostname = process.env.NEXT_PUBLIC_S3_BUCKET_HOSTNAME;

const remotePatterns = [
  { protocol: "https", hostname: "cards.scryfall.io" },
  { protocol: "https", hostname: "c1.scryfall.com" },
  { protocol: "https", hostname: "meu-bucket-cartas-strixhaven.s3.us-east-1.amazonaws.com" },
];

if (cloudfrontHostname) {
  remotePatterns.push({ protocol: "https", hostname: cloudfrontHostname });
}

if (s3BucketHostname) {
  remotePatterns.push({ protocol: "https", hostname: s3BucketHostname });
}

const nextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
