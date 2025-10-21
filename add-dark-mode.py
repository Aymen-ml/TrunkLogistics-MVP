#!/usr/bin/env python3
"""
Dark Mode Implementation Script
Systematically adds dark mode classes to all React components
"""

import re
import os
import sys

def add_dark_mode_classes(content):
    """Add dark mode classes to component content"""
    
    # Store original for comparison
    original = content
    
    # 1. Page backgrounds - min-h-screen
    content = re.sub(
        r'className="([^"]*?)bg-gray-50([^"]*?)"',
        r'className="\1bg-gray-50 dark:bg-gray-900\2"',
        content
    )
    
    # 2. Card/Panel backgrounds - bg-white
    content = re.sub(
        r'className="([^"]*?)bg-white([^"]*?)"',
        r'className="\1bg-white dark:bg-gray-800\2"',
        content
    )
    
    # 3. Heading text - text-gray-900
    content = re.sub(
        r'text-gray-900(?! dark:)',
        r'text-gray-900 dark:text-gray-100',
        content
    )
    
    # 4. Body/muted text
    content = re.sub(
        r'text-gray-700(?! dark:)',
        r'text-gray-700 dark:text-gray-200',
        content
    )
    content = re.sub(
        r'text-gray-600(?! dark:)',
        r'text-gray-600 dark:text-gray-400',
        content
    )
    content = re.sub(
        r'text-gray-500(?! dark:)',
        r'text-gray-500 dark:text-gray-400',
        content
    )
    content = re.sub(
        r'text-gray-400(?! dark:)',
        r'text-gray-400 dark:text-gray-500',
        content
    )
    
    # 5. Borders
    content = re.sub(
        r'border-gray-200(?! dark:)',
        r'border-gray-200 dark:border-gray-700',
        content
    )
    content = re.sub(
        r'border-gray-300(?! dark:)',
        r'border-gray-300 dark:border-gray-600',
        content
    )
    content = re.sub(
        r'divide-gray-200(?! dark:)',
        r'divide-gray-200 dark:divide-gray-700',
        content
    )
    
    # 6. Secondary backgrounds
    content = re.sub(
        r'bg-gray-100(?! dark:)',
        r'bg-gray-100 dark:bg-gray-700',
        content
    )
    
    # 7. Hover states
    content = re.sub(
        r'hover:bg-gray-50(?! dark:)',
        r'hover:bg-gray-50 dark:hover:bg-gray-700',
        content
    )
    content = re.sub(
        r'hover:bg-gray-100(?! dark:)',
        r'hover:bg-gray-100 dark:hover:bg-gray-700',
        content
    )
    
    # 8. Status badge backgrounds and text (more specific patterns)
    content = re.sub(
        r'bg-yellow-100(?! dark:)',
        r'bg-yellow-100 dark:bg-yellow-900',
        content
    )
    content = re.sub(
        r'text-yellow-800(?! dark:)',
        r'text-yellow-800 dark:text-yellow-200',
        content
    )
    content = re.sub(
        r'bg-blue-100(?! dark:)',
        r'bg-blue-100 dark:bg-blue-900',
        content
    )
    content = re.sub(
        r'text-blue-800(?! dark:)',
        r'text-blue-800 dark:text-blue-200',
        content
    )
    content = re.sub(
        r'bg-green-100(?! dark:)',
        r'bg-green-100 dark:bg-green-900',
        content
    )
    content = re.sub(
        r'text-green-800(?! dark:)',
        r'text-green-800 dark:text-green-200',
        content
    )
    content = re.sub(
        r'bg-red-100(?! dark:)',
        r'bg-red-100 dark:bg-red-900',
        content
    )
    content = re.sub(
        r'text-red-800(?! dark:)',
        r'text-red-800 dark:text-red-200',
        content
    )
    content = re.sub(
        r'bg-purple-100(?! dark:)',
        r'bg-purple-100 dark:bg-purple-900',
        content
    )
    content = re.sub(
        r'text-purple-800(?! dark:)',
        r'text-purple-800 dark:text-purple-200',
        content
    )
    content = re.sub(
        r'bg-gray-100 text-gray-800(?! dark:)',
        r'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
        content
    )
    
    return content, content != original

def process_file(filepath):
    """Process a single file"""
    print(f"Processing: {filepath}")
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content, changed = add_dark_mode_classes(content)
        
        if changed:
            # Backup original
            backup_path = filepath + '.bak'
            with open(backup_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            # Write updated content
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            print(f"  ✅ Updated (backup: {backup_path})")
            return True
        else:
            print(f"  ⏭️  No changes needed")
            return False
    
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False

def main():
    """Main function"""
    files_to_process = [
        # Dashboard files
        'client/src/components/dashboard/ProviderDashboard.jsx',
        'client/src/components/dashboard/AdminDashboard.jsx',
        'client/src/components/dashboard/DashboardRouter.jsx',
        
        # Booking pages
        'client/src/components/bookings/BookingList.jsx',
        'client/src/components/bookings/BookingDetail.jsx',
        'client/src/components/bookings/BookingForm.jsx',
        'client/src/components/bookings/EditBooking.jsx',
        
        # Admin pages
        'client/src/components/admin/UserManagement.jsx',
        'client/src/components/admin/BookingManagement.jsx',
        'client/src/components/admin/ProviderVerification.jsx',
        'client/src/components/admin/DocumentVerification.jsx',
        'client/src/components/admin/TrucksAdmin.jsx',
        'client/src/components/admin/AdminAnalytics.jsx',
        
        # Profile pages
        'client/src/components/profile/Profile.jsx',
        
        # Common components
        'client/src/components/common/EmailVerificationBanner.jsx',
        'client/src/components/common/AdminApprovalBanner.jsx',
        'client/src/components/common/DocumentUpload.jsx',
        'client/src/components/common/ImageUpload.jsx',
        'client/src/components/common/FileUpload.jsx',
        'client/src/components/common/LoadingSpinner.jsx',
        'client/src/components/common/Toast.jsx',
        
        # Truck pages
        'client/src/components/trucks/TruckForm.jsx',
        'client/src/components/trucks/TruckSearch.jsx',
        'client/src/components/trucks/TruckList.jsx',
        'client/src/components/trucks/TruckDetail.jsx',
        
        # Auth pages
        'client/src/components/auth/Login.jsx',
        'client/src/components/auth/Register.jsx',
        'client/src/components/auth/ForgotPassword.jsx',
        'client/src/components/auth/ResetPassword.jsx',
        'client/src/components/auth/ProviderRegistrationForm.jsx',
        'client/src/components/auth/EmailVerification.jsx',
        'client/src/components/auth/VerificationPending.jsx',
        
        # Document pages
        'client/src/components/documents/DocumentList.jsx',
        
        # Notification components
        'client/src/components/notifications/NotificationCenter.jsx',
        'client/src/components/notifications/NotificationBell.jsx',
    ]
    
    updated_count = 0
    not_found_count = 0
    
    for filepath in files_to_process:
        if os.path.exists(filepath):
            if process_file(filepath):
                updated_count += 1
        else:
            print(f"⏭️  File not found: {filepath}")
            not_found_count += 1
    
    print(f"\n🎉 Complete!")
    print(f"  ✅ Updated: {updated_count} files")
    print(f"  ⏭️  Not found: {not_found_count} files")
    print("⚠️  Please review changes and test thoroughly")

if __name__ == '__main__':
    main()
