#!/bin/bash

# Fix duplicate dark: classes in JSX files
find /home/aymen/Downloads/LogisticApp-main/client/src/components -name "*.jsx" -type f -exec sed -i '
s/dark:bg-gray-800 dark:bg-gray-800 dark:bg-gray-800 dark:bg-gray-800/dark:bg-gray-800/g
s/dark:bg-gray-800 dark:bg-gray-800 dark:bg-gray-800/dark:bg-gray-800/g
s/dark:bg-gray-800 dark:bg-gray-800/dark:bg-gray-800/g
s/dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900/dark:bg-gray-900/g
s/dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900/dark:bg-gray-900/g
s/dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900/dark:bg-gray-900/g
s/dark:bg-gray-900 dark:bg-gray-900/dark:bg-gray-900/g
s/dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500/dark:text-gray-400/g
s/dark:text-gray-500 dark:text-gray-400 dark:text-gray-500/dark:text-gray-400/g
s/hover:bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900/hover:bg-gray-50 dark:hover:bg-gray-700/g
s/hover:bg-gray-50 dark:bg-gray-900 dark:bg-gray-900/hover:bg-gray-50 dark:hover:bg-gray-700/g
s/bg-white dark:bg-gray-800 dark:bg-gray-800 dark:bg-gray-800 hover:bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900/bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/g
' {} \;

echo "Fixed duplicate dark mode classes"
