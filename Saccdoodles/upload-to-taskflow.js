const fs = require('fs');
const https = require('https');

const API_URL = 'https://task-system-nine.vercel.app';
// TODO: Move this to environment variable or delete this file if no longer needed
const API_KEY = 'YOUR_TASKFLOW_API_KEY_HERE';

const pages = [
    { file: 'index-tailwind.html', title: 'SACC Doodles - Home Page' },
    { file: 'our-dogs-tailwind.html', title: 'SACC Doodles - Our Dogs' },
    { file: 'available-puppies-tailwind.html', title: 'SACC Doodles - Available Puppies' },
    { file: 'waitlist-tailwind.html', title: 'SACC Doodles - Waitlist' },
    { file: 'guardian-home-tailwind.html', title: 'SACC Doodles - Guardian Home Program' },
    { file: 'puppy-resources-tailwind.html', title: 'SACC Doodles - Puppy Resources' },
    { file: 'contact-tailwind.html', title: 'SACC Doodles - Contact Us' },
    { file: 'faq-tailwind.html', title: 'SACC Doodles - FAQ' },
    { file: 'happy-families-tailwind.html', title: 'SACC Doodles - Happy Families' },
    { file: 'health-testing-tailwind.html', title: 'SACC Doodles - Health Testing' },
    { file: 'admin-tailwind.html', title: 'SACC Doodles - Admin Dashboard' }
];

async function uploadResource(title, content) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            name: title,
            content: content,
            type: 'html'
        });

        const url = new URL('/api/v1/resources', API_URL);

        const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(body);
                    resolve(result);
                } catch (e) {
                    resolve({ raw: body });
                }
            });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function main() {
    console.log('Starting upload to TaskFlow...\n');

    for (const page of pages) {
        try {
            const content = fs.readFileSync(page.file, 'utf8');
            console.log(`Uploading: ${page.title}...`);

            const result = await uploadResource(page.title, content);

            if (result.success && result.data) {
                console.log(`  Success! ID: ${result.data.id}`);
            } else if (result.error) {
                console.log(`  Error: ${result.error}`);
            } else {
                console.log(`  Response: ${JSON.stringify(result)}`);
            }
        } catch (err) {
            console.log(`  Failed: ${err.message}`);
        }
    }

    console.log('\nUpload complete!');
}

main();
