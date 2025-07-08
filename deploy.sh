#!/bin/bash

# Deployment script for Ezzy
# Make sure to replace YOUR_GITHUB_REPO_URL with your actual GitHub repository URL

echo "🚀 Starting deployment process for Ezzy..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the project root directory."
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Error: Git repository not initialized. Run 'git init' first."
    exit 1
fi

# Check if remote origin is set
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "⚠️  No remote origin set. Please add your GitHub repository:"
    echo "   git remote add origin YOUR_GITHUB_REPO_URL"
    echo "   Then run this script again."
    exit 1
fi

# Add all changes
echo "📦 Adding all changes..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "ℹ️  No changes to commit."
else
    # Commit changes
    echo "💾 Committing changes..."
    git commit -m "Deploy: Updated Ezzy application $(date '+%Y-%m-%d %H:%M:%S')"
fi

# Push to GitHub
echo "🔄 Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "Next steps:"
    echo "1. Set up Supabase database using the migration script"
    echo "2. Deploy to Vercel and configure environment variables"
    echo "3. See DEPLOYMENT_GUIDE.md for detailed instructions"
else
    echo "❌ Failed to push to GitHub. Please check your repository URL and permissions."
    exit 1
fi

echo "🎉 Deployment preparation complete!"