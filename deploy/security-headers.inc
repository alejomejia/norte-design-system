# Security headers for every response, included by each location in `nginx.conf`. HSTS is set at Cloudflare, the edge
# that serves HTTPS to browsers.

# Storybook renders stories in a same-origin iframe, so only this site may frame its pages (clickjacking). No plugins,
# and no <base> pointing scripts elsewhere. Scripts stay unrestricted: Storybook's HTML runs inline ones, and the site
# has no accounts, cookies or user input for a stricter policy to protect.
add_header Content-Security-Policy "frame-ancestors 'self'; object-src 'none'; base-uri 'self'" always;
add_header X-Frame-Options SAMEORIGIN always;
add_header X-Content-Type-Options nosniff always;
add_header Referrer-Policy strict-origin-when-cross-origin always;
# The Voice input stories ask for the microphone; nothing asks for the rest.
add_header Permissions-Policy "camera=(), geolocation=(), microphone=(self), payment=(), usb=()" always;
