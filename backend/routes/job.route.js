import express from 'express';
import * as jobController from '../controllers/job.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import upload from '../lib/multerConfig.js';

const router = express.Router();

// public listing and detail
router.get('/', jobController.listJobs);
// user-specific endpoints (must come before '/:id')
router.get('/me/saved', protectRoute, jobController.getMySavedJobs);
router.get('/me/applications', protectRoute, jobController.getMyApplications);
router.post('/me/save/:id', protectRoute, jobController.saveJobForUser);
router.post('/me/unsave/:id', protectRoute, jobController.unsaveJobForUser);

router.get('/:id', jobController.getJob);

// protected actions
router.post('/', protectRoute, jobController.createJob);
router.put('/:id', protectRoute, jobController.updateJob);
router.delete('/:id', protectRoute, jobController.deleteJob);
// apply with optional resume upload (field name: resume)
router.post('/:id/apply', protectRoute, upload.single('resume'), jobController.applyToJob);

export default router;
