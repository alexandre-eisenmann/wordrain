# Deployment Guide

## GitHub Pages Deployment

This project is optimized for static deployment to GitHub Pages.

### Automatic Deployment (Recommended)

1. **Push to GitHub**: The project includes a GitHub Actions workflow that automatically deploys to GitHub Pages when you push to the `main` branch.

2. **Enable GitHub Pages**:
   - Go to your repository Settings
   - Navigate to "Pages" in the sidebar
   - Under "Source", select "GitHub Actions"

3. **Deploy**: Simply push your code to the `main` branch and the workflow will automatically build and deploy your site.

### Manual Deployment

If you prefer manual deployment:

```bash
# Build the project
npm run build

# The built files will be in the `dist` directory
# Upload the contents of `dist` to your hosting service
```

### Other Static Hosting Options

The built files in the `dist` directory can be deployed to:

- **Netlify**: Drag and drop the `dist` folder
- **Vercel**: Connect your GitHub repository
- **Firebase Hosting**: Use `firebase deploy`
- **Any static hosting service**

### Build Output

The build process creates:
- `dist/index.html` - Main HTML file
- `dist/assets/` - JavaScript, CSS, and other assets
- All static assets (audio, images, etc.) are copied to the output

### Local Testing

Test the production build locally:

```bash
npm run build
npm run preview
```

This will serve the built files locally so you can verify everything works before deploying. 