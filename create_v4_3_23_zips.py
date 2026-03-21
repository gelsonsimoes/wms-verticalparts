import zipfile
import os

VERSION = "4.3.23"

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
    dist_zip = f'dist_v{VERSION.replace(".", "_")}_PRO.zip'
    if os.path.exists('dist'):
        create_zip('dist', dist_zip)
    else:
        print("Error: 'dist' folder not found.")
    
    # Create backend zip
    backend_zip = f'backend_v{VERSION.replace(".", "_")}_PRO.zip'
    with zipfile.ZipFile(backend_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Zip 'server' folder
        if os.path.exists('server'):
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
        # Add api_ia.php
        if os.path.exists('api_ia.php'):
            zipf.write('api_ia.php', 'api_ia.php')
            
    print(f"Backend zip created: {backend_zip}")
