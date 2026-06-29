#!/bin/bash

# Image Optimization Script for Alpine Chough Portfolio
# This script optimizes the large PNG portrait images to JPG format

echo "🖼️  Alpine Chough - Image Optimization Script"
echo "=============================================="
echo ""

# Check if we're in the right directory
if [ ! -d "public/Portrait_cycle" ]; then
    echo "❌ Error: public/Portrait_cycle directory not found"
    echo "Please run this script from the project root"
    exit 1
fi

# Create backup directory
echo "📦 Creating backup directory..."
mkdir -p public/Portrait_cycle/originals

# Install sharp-cli if needed
if ! command -v sharp &> /dev/null; then
    echo "📥 Installing sharp-cli (required for image optimization)..."
    npm install -g sharp-cli
fi

echo ""
echo "🔄 Optimizing portrait images..."
echo ""

cd public/Portrait_cycle

# Track savings
ORIGINAL_SIZE=0
OPTIMIZED_SIZE=0

# Optimize PNG files to JPG
for file in *.png; do
    if [ -f "$file" ]; then
        ORIG_SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
        ORIGINAL_SIZE=$((ORIGINAL_SIZE + ORIG_SIZE))
        
        echo "  Processing: $file ($(numfmt --to=iec-i --suffix=B $ORIG_SIZE))"
        
        # Move original to backup
        cp "$file" "originals/$file"
        
        # Convert to optimized JPG
        OUTPUT="${file%.png}.jpg"
        npx sharp -i "$file" -o "$OUTPUT" resize 1920 --withoutEnlargement --format jpeg --quality 85
        
        # Remove original PNG
        rm "$file"
        
        if [ -f "$OUTPUT" ]; then
            OPT_SIZE=$(stat -f%z "$OUTPUT" 2>/dev/null || stat -c%s "$OUTPUT" 2>/dev/null)
            OPTIMIZED_SIZE=$((OPTIMIZED_SIZE + OPT_SIZE))
            echo "    ✅ Saved as: $OUTPUT ($(numfmt --to=iec-i --suffix=B $OPT_SIZE))"
            SAVED=$((ORIG_SIZE - OPT_SIZE))
            PERCENT=$((SAVED * 100 / ORIG_SIZE))
            echo "    💾 Saved: $(numfmt --to=iec-i --suffix=B $SAVED) ($PERCENT%)"
        fi
        echo ""
    fi
done

# Optimize existing JPG files
for file in AM_Portrait.jpg 118_1808_Original.jpg IMG_6396.jpg; do
    if [ -f "$file" ]; then
        ORIG_SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
        ORIGINAL_SIZE=$((ORIGINAL_SIZE + ORIG_SIZE))
        
        echo "  Processing: $file ($(numfmt --to=iec-i --suffix=B $ORIG_SIZE))"
        
        # Move original to backup
        cp "$file" "originals/$file"
        
        # Optimize JPG
        npx sharp -i "originals/$file" -o "$file" resize 1920 --withoutEnlargement --format jpeg --quality 85
        
        if [ -f "$file" ]; then
            OPT_SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
            OPTIMIZED_SIZE=$((OPTIMIZED_SIZE + OPT_SIZE))
            echo "    ✅ Optimized: $(numfmt --to=iec-i --suffix=B $OPT_SIZE))"
            SAVED=$((ORIG_SIZE - OPT_SIZE))
            if [ $SAVED -gt 0 ]; then
                PERCENT=$((SAVED * 100 / ORIG_SIZE))
                echo "    💾 Saved: $(numfmt --to=iec-i --suffix=B $SAVED) ($PERCENT%)"
            fi
        fi
        echo ""
    fi
done

cd ../..

echo ""
echo "✨ Optimization complete!"
echo ""
echo "📊 Summary:"
echo "  Original size:  $(numfmt --to=iec-i --suffix=B $ORIGINAL_SIZE)"
echo "  Optimized size: $(numfmt --to=iec-i --suffix=B $OPTIMIZED_SIZE)"
TOTAL_SAVED=$((ORIGINAL_SIZE - OPTIMIZED_SIZE))
TOTAL_PERCENT=$((TOTAL_SAVED * 100 / ORIGINAL_SIZE))
echo "  Total saved:    $(numfmt --to=iec-i --suffix=B $TOTAL_SAVED) ($TOTAL_PERCENT%)"
echo ""
echo "📁 Original files backed up to: public/Portrait_cycle/originals/"
echo ""
echo "🚀 Next steps:"
echo "  1. Test your site: npm run dev"
echo "  2. If everything looks good, you can delete the originals folder"
echo "  3. Commit the optimized images to your repo"
