#!/bin/bash

echo "🚀 GE Counter Setup Script"
echo "=========================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ npm found: $(npm --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
else
    echo "❌ Failed to install dependencies."
    exit 1
fi

# Check if .env file needs to be configured
echo ""
echo "🔧 Checking environment configuration..."

if grep -q "your_api_key_here" .env; then
    echo "⚠️  Please configure your Firebase settings in .env file:"
    echo "   1. Create a Firebase project at https://console.firebase.google.com/"
    echo "   2. Enable Firestore Database"
    echo "   3. Get your web app configuration"
    echo "   4. Update the .env file with your Firebase credentials"
    echo ""
    echo "📝 Edit .env file and replace placeholder values with your Firebase config"
else
    echo "✅ Environment file appears to be configured"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure Firebase (see README.md for detailed instructions)"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Open http://localhost:5173 in your browser"
echo ""
echo "📚 For detailed setup instructions, see README.md"
