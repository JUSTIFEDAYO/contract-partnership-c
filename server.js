// server.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

const app = express();
const PORT = process.env.PORT || 3000;

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dspag2aww',
    api_key: process.env.CLOUDINARY_API_KEY || '576135641335578',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'QGBFL9uUfnUGQvlEyKZ6WTCPC3c'
});

// Create uploads directory if it doesn't exist (for local fallback)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// CORS configuration - allow all origins for deployment
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: false
}));

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Multer configuration for file uploads
const storage = multer.memoryStorage(); // Use memory storage instead of disk

const fileFilter = (req, file, cb) => {
    // Allow only images and PDFs
    const allowedMimes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf'
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files and PDFs are allowed'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max file size
    }
});

// Serve static files
app.use(express.static(__dirname));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Helper function to upload to Cloudinary
async function uploadToCloudinary(fileBuffer, fileName, resourceType = 'auto') {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                resource_type: resourceType,
                public_id: `partnership_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                folder: 'contract-partnership-forms'
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );

        stream.end(fileBuffer);
    });
}

// API endpoint to handle form submission
app.post('/api/submit-form', upload.single('idUpload'), async (req, res) => {
    try {
        let signatureFile = null;
        let idUploadFile = null;

        // Process signature image if provided
        if (req.body.signature) {
            try {
                const base64Data = req.body.signature.replace(/^data:image\/png;base64,/, '');
                const signatureBuffer = Buffer.from(base64Data, 'base64');

                console.log('Uploading signature to Cloudinary...');
                const signatureResult = await uploadToCloudinary(signatureBuffer, 'signature', 'image');

                signatureFile = {
                    filename: signatureResult.public_id,
                    url: signatureResult.secure_url,
                    cloudinaryId: signatureResult.public_id,
                    mimetype: 'image/png'
                };

                console.log('✓ Signature uploaded to Cloudinary:', signatureFile.url);
            } catch (err) {
                console.error('Error uploading signature to Cloudinary:', err);
                return res.status(500).json({ error: 'Failed to upload signature' });
            }
        }

        // Process ID upload if provided
        if (req.file) {
            try {
                console.log('Uploading ID document to Cloudinary...');
                const idResult = await uploadToCloudinary(req.file.buffer, req.file.originalname, 'auto');

                idUploadFile = {
                    filename: idResult.public_id,
                    url: idResult.secure_url,
                    cloudinaryId: idResult.public_id,
                    originalName: req.file.originalname,
                    mimetype: req.file.mimetype,
                    size: req.file.size
                };

                console.log('✓ ID document uploaded to Cloudinary:', idUploadFile.url);
            } catch (err) {
                console.error('Error uploading ID to Cloudinary:', err);
                return res.status(500).json({ error: 'Failed to upload ID document' });
            }
        }

        // Extract form data
        const formData = {
            timestamp: new Date().toISOString(),
            personal: {
                fullName: req.body.fullName,
                businessName: req.body.businessName || null,
                entityType: req.body.entityType
            },
            taxId: {
                ssnNumber: req.body.ssn,
                idUploadFile: idUploadFile
            },
            address: {
                street: req.body.street,
                city: req.body.city,
                state: req.body.state,
                zipCode: req.body.zip
            },
            certification: {
                certified: req.body.certify === 'on' || req.body.certify === true,
                signatureFile: signatureFile,
                date: req.body.date
            }
        };

        // Validate required fields
        if (!formData.personal.fullName || !formData.personal.entityType) {
            return res.status(400).json({ error: 'Missing required personal information' });
        }

        if (!formData.taxId.ssnNumber || !formData.taxId.idUploadFile) {
            return res.status(400).json({ error: 'Missing required tax ID information' });
        }

        if (!formData.address.street || !formData.address.city || !formData.address.state || !formData.address.zipCode) {
            return res.status(400).json({ error: 'Missing required address information' });
        }

        if (!formData.certification.certified || !formData.certification.signatureFile || !formData.certification.date) {
            return res.status(400).json({ error: 'Missing required certification information' });
        }

        // Save to JSON file (for local backup)
        const submissionsDir = path.join(__dirname, 'submissions');
        if (!fs.existsSync(submissionsDir)) {
            fs.mkdirSync(submissionsDir, { recursive: true });
        }

        const timestamp = new Date().getTime();
        const jsonFilePath = path.join(submissionsDir, `submission-${timestamp}.json`);
        fs.writeFileSync(jsonFilePath, JSON.stringify(formData, null, 2));

        // Log to console
        console.log('\n========================================');
        console.log('NEW FORM SUBMISSION');
        console.log('========================================');
        console.log(JSON.stringify(formData, null, 2));
        console.log('========================================\n');

        // Send success response
        res.status(200).json({
            success: true,
            message: 'Form submitted successfully',
            submissionId: timestamp,
            files: {
                signature: signatureFile?.url,
                idDocument: idUploadFile?.url
            }
        });

    } catch (error) {
        console.error('Form submission error:', error);
        res.status(500).json({ 
            error: 'Error processing form submission',
            details: error.message 
        });
    }
});

// Error handling for multer
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'FILE_TOO_LARGE') {
            return res.status(400).json({ error: 'File is too large. Maximum size is 10MB.' });
        }
        return res.status(400).json({ error: error.message });
    } else if (error) {
        return res.status(400).json({ error: error.message });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n✓ Server running at ${process.env.NODE_ENV === 'production' ? 'https' : 'http'}://localhost:${PORT}`);
    console.log(`✓ Cloudinary connected to: ${cloudinary.config().cloud_name}`);
    console.log(`✓ Images will be uploaded to Cloudinary\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n✓ Server shutting down gracefully...');
    process.exit(0);
});
