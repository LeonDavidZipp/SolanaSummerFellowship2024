#!/usr/bin/env zsh

# Don't forget to give this exec permissions:
# chmod +x setup.sh

echo "Installing dependencies..."
npm install
echo "Building..."
npm run build
echo "Linking..."
npm link
echo "Done!"
echo "Try flare -h to get started."