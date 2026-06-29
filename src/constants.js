export const APP = {
  name: 'LogoForge',
  maxFileSizeBytes: 30 * 1024 * 1024,
  minImageSize: 16,
  defaultPaddingPercent: 10,
  zipFileName: 'logoforge-icons.zip'
};

export const ACCEPTED_TYPES = ['image/png', 'image/svg+xml'];

export const QUALITY_SETTINGS = {
  fast: { label: 'Fast', picaQuality: 0, compressionQuality: 0.9 },
  high: { label: 'High Quality', picaQuality: 2, compressionQuality: 0.92 },
  ultra: { label: 'Ultra Quality', picaQuality: 3, compressionQuality: 0.96 }
};

export const PREVIEW_SIZES = new Set([16, 32, 64, 128, 192, 512]);

export const ICON_GROUPS = [
  {
    group: 'favicon',
    folder: 'favicon',
    files: [
      { name: 'favicon-16x16.png', width: 16, height: 16 },
      { name: 'favicon-32x32.png', width: 32, height: 32 },
      { name: 'favicon-48x48.png', width: 48, height: 48 },
      { name: 'favicon-64x64.png', width: 64, height: 64 },
      { name: 'favicon-96x96.png', width: 96, height: 96 },
      { name: 'favicon-128x128.png', width: 128, height: 128 },
      { name: 'favicon-256x256.png', width: 256, height: 256 },
      { name: 'favicon-512x512.png', width: 512, height: 512 }
    ]
  },
  {
    group: 'apple',
    folder: 'apple',
    files: [57, 60, 72, 76, 114, 120, 144, 152, 167, 180].map((size) => ({
      name: `apple-touch-icon-${size}x${size}.png`,
      width: size,
      height: size
    }))
  },
  {
    group: 'android',
    folder: 'android',
    files: [36, 48, 72, 96, 144, 192, 512].map((size) => ({
      name: `android-icon-${size}x${size}.png`,
      width: size,
      height: size
    }))
  },
  {
    group: 'pwa',
    folder: 'pwa',
    files: [
      { name: 'icon-192x192.png', width: 192, height: 192 },
      { name: 'icon-512x512.png', width: 512, height: 512 },
      { name: 'maskable-icon-192x192.png', width: 192, height: 192, maskable: true },
      { name: 'maskable-icon-512x512.png', width: 512, height: 512, maskable: true }
    ]
  },
  {
    group: 'microsoft',
    folder: 'microsoft',
    files: [
      { name: 'mstile-70x70.png', width: 70, height: 70 },
      { name: 'mstile-144x144.png', width: 144, height: 144 },
      { name: 'mstile-150x150.png', width: 150, height: 150 },
      { name: 'mstile-310x310.png', width: 310, height: 310 }
    ]
  },
  {
    group: 'social',
    folder: 'social',
    files: [
      { name: 'opengraph-1200x630.png', width: 1200, height: 630, containOnly: true },
      { name: 'twitter-800x418.png', width: 800, height: 418, containOnly: true }
    ]
  },
  {
    group: 'generic',
    folder: 'generic',
    files: [16, 24, 32, 48, 64, 72, 96, 128, 192, 256, 384, 512, 1024].map((size) => ({
      name: `logo-${size}x${size}.png`,
      width: size,
      height: size
    }))
  }
];

