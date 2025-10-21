#!/bin/bash

# Dark Mode Implementation Script
# Systematically adds dark mode classes to all components

set -e

echo "🌙 Adding Dark Mode Support to All Components..."

# Function to add dark mode to a file
add_dark_mode() {
    local file="$1"
    echo "Processing: $file"
    
    # Backup file
    cp "$file" "$file.bak"
    
    # Page backgrounds
    sed -i 's/className="min-h-screen bg-gray-50/className="min-h-screen bg-gray-50 dark:bg-gray-900/g' "$file"
    
    # Card/Panel backgrounds
    sed -i 's/className="\([^"]*\)bg-white\([^"]*\)"/className="\1bg-white dark:bg-gray-800\2"/g' "$file"
    
    # Heading text
    sed -i 's/text-gray-900\([^"]*\)"/text-gray-900 dark:text-gray-100\1"/g' "$file"
    sed -i 's/text-2xl\([^"]*\)font-bold text-gray-900/text-2xl\1font-bold text-gray-900 dark:text-gray-100/g' "$file"
    
    # Body text
    sed -i 's/text-gray-600\([^"]*\)"/text-gray-600 dark:text-gray-400\1"/g' "$file"
    sed -i 's/text-gray-700\([^"]*\)"/text-gray-700 dark:text-gray-200\1"/g' "$file"
    sed -i 's/text-gray-500\([^"]*\)"/text-gray-500 dark:text-gray-400\1"/g' "$file"
    
    # Borders
    sed -i 's/border-gray-200\([^"]*\)"/border-gray-200 dark:border-gray-700\1"/g' "$file"
    sed -i 's/divide-gray-200\([^"]*\)"/divide-gray-200 dark:divide-gray-700\1"/g' "$file"
    sed -i 's/border-gray-300\([^"]*\)"/border-gray-300 dark:border-gray-600\1"/g' "$file"
    
    # Hover states
    sed -i 's/hover:bg-gray-50\([^"]*\)"/hover:bg-gray-50 dark:hover:bg-gray-700\1"/g' "$file"
    sed -i 's/hover:bg-gray-100\([^"]*\)"/hover:bg-gray-100 dark:hover:bg-gray-700\1"/g' "$file"
    
    # Secondary backgrounds
    sed -i 's/bg-gray-100\([^"]*\)"/bg-gray-100 dark:bg-gray-700\1"/g' "$file"
    sed -i 's/bg-gray-50\([^"]*\)"/bg-gray-50 dark:bg-gray-800\1"/g' "$file"
    
    echo "✅ Completed: $file"
}

# Provider Dashboard
add_dark_mode "client/src/components/dashboard/ProviderDashboard.jsx"

# Admin Dashboard  
add_dark_mode "client/src/components/dashboard/AdminDashboard.jsx"

echo "🎉 Dark mode added to all dashboards!"
echo "Note: Manual review recommended for complex components"
