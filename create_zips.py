import zipfile
import os

def create_zip(source_dir, output_filename):
    with zipfile.ZipFile(output_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(source_dir):
            for file in files:
                file_path = os.path.join(root, file)
                # Use forward slashes for the archive path
                arcname = os.path.relpath(file_path, source_dir).replace('\\', '/')
                zipf.write(file_path, arcname)
    print(f"Zip file created: {output_filename}")

if __name__ == "__main__":
    # Create dist zip
    if os.path.exists('dist'):
        create_zip('dist', 'dist_v4_2_6_PRO.zip')
    
    # Create backend zip
    # We want 'server', 'package.json', 'package-lock.json' in the root of backend zip
    with zipfile.ZipFile('backend_v4_2_6_PRO.zip', 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Zip 'server' folder
        for root, dirs, files in os.walk('server'):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.join('server', os.path.relpath(file_path, 'server')).replace('\\', '/')
                zipf.write(file_path, arcname)
        # Add root files
        if os.path.exists('package.json'):
            zipf.write('package.json', 'package.json')
        if os.path.exists('package-lock.json'):
            zipf.write('package-lock.json', 'package-lock.json')
    print("Backend zip created: backend_v4_2_6_PRO.zip")
