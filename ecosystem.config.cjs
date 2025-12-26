const path = require('path');
const fs = require('fs');

// Load .env file manually
const envPath = path.join(__dirname, '.env');
const envVars = {};

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...valueParts] = trimmed.split('=');
            if (key && valueParts.length > 0) {
                let value = valueParts.join('=');
                // Remove quotes if present
                value = value.replace(/^["']|["']$/g, '');
                envVars[key.trim()] = value;
            }
        }
    });
}

module.exports = {
    apps: [
        {
            name: 'mypanel',
            port: '3031',
            exec_mode: 'cluster',
            instances: '1',
            script: './.output/server/index.mjs',
            env: envVars
        }
    ]
};
